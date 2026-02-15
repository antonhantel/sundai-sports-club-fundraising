import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbAssetToAsset, assetToDbAsset } from "@/lib/supabase/helpers"
import { getJerseyPrompt } from "@/lib/jersey-prompt"
import { GoogleGenAI } from "@google/genai"
import type { AssetType } from "@/lib/types"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ success: true, assets: [] })
    }

    // Get assets for the team
    const { data: assets, error: assetsError } = await supabase
      .from("assets")
      .select("*")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false })

    if (assetsError) {
      return NextResponse.json({ error: assetsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assets: assets ? assets.map(dbAssetToAsset) : [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's team with full details
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Check if this is a file upload (FormData) or JSON request
    const contentType = request.headers.get("content-type") || ""
    let type: AssetType
    let assetName: string | undefined
    let assetUrl: string | undefined
    let sponsorName: string | undefined

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData()
      const file = formData.get("file") as File
      const typeStr = formData.get("type") as string
      assetName = formData.get("name") as string

      if (!file) {
        return NextResponse.json({ error: "File is required" }, { status: 400 })
      }

      if (!typeStr || (typeStr !== "proposal" && typeStr !== "jersey-mockup" && typeStr !== "logo" && typeStr !== "media")) {
        return NextResponse.json({ error: "Valid asset type is required (proposal, jersey-mockup, logo, or media)" }, { status: 400 })
      }
      
      type = typeStr as AssetType

      // Validate file type (images only for now)
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are supported" }, { status: 400 })
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Determine file extension
      const fileExt = file.name.split(".").pop() || "png"
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      // Determine folder based on type
      let folder = "assets"
      if (type === "jersey-mockup") {
        folder = "jerseys"
      } else if (type === "logo") {
        folder = "logos"
      } else if (type === "proposal") {
        folder = "proposals"
      } else if (type === "media") {
        folder = "media"
      }

      const fileName = `${type}-${uniqueId}.${fileExt}`
      const filePath = `teams/${team.id}/${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("assets")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError)
        return NextResponse.json(
          { error: `Failed to upload file: ${uploadError.message}` },
          { status: 500 }
        )
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("assets")
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        return NextResponse.json(
          { error: "Failed to get public URL for uploaded file" },
          { status: 500 }
        )
      }

      assetUrl = urlData.publicUrl
      assetName = assetName || `${type} - ${new Date().toLocaleDateString()}`
    } else {
      // Handle JSON request (jersey generation)
      const body = await request.json()
      type = body.type as AssetType
      assetName = body.name
      assetUrl = body.url
      sponsorName = body.sponsorName
    }

    // Generate jersey mockup using nanobanana (only if not already uploaded)
    if (type === "jersey-mockup" && !assetUrl) {
      try {
        // Add subtle variation to prompt to ensure different results each time
        // Since Gemini image generation doesn't support temperature, we add minimal randomness to the prompt
        const variationStyles = [
          "slightly modern",
          "slightly classic",
          "slightly bold",
          "slightly refined",
        ]
        const randomStyle = variationStyles[Math.floor(Math.random() * variationStyles.length)]
        
        // Get the prompt from the configuration file
        let prompt = getJerseyPrompt({
          teamName: team.name,
          primaryColor: team.primary_color,
          secondaryColor: team.secondary_color,
          sponsorName: sponsorName || undefined,
        })
        
        // Add subtle variation instruction to the prompt (reduced from previous version)
        prompt = `${prompt}\n\nNote: Create a ${randomStyle} variation of the design.`

        // Get API key for image generation
        // For Replicate (default): Use NANOBANANA_API_KEY with your Replicate API token
        // For other providers: Use NANOBANANA_API_KEY with the appropriate API key
        const apiKey = process.env.NANOBANANA_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

        if (!apiKey) {
          return NextResponse.json(
            { 
              error: "API key not configured",
              details: "Please set NANOBANANA_API_KEY in your .env.local file. For Google Gemini, get your API key from https://makersuite.google.com/app/apikey"
            },
            { status: 500 }
          )
        }

        try {
          /**
           * IMAGE GENERATION API PROVIDER
           * 
           * Currently using: Google Gemini Nano Banana (Flash 3) - FAST & EFFICIENT
           * - Model: gemini-2.5-flash-image (fast) or gemini-3-pro-image-preview (pro)
           * - Cost: Free tier available, then pay-per-use (check Google AI pricing)
           * - Quality: Excellent, native Google integration
           * - Speed: ~3-5 seconds per image (Flash), ~5-10 seconds (Pro)
           * - API: https://ai.google.dev/gemini-api/docs/image-generation
           * - Note: All images include SynthID watermark for authenticity
           * 
           * ALTERNATIVE OPTIONS (documented for easy switching):
           * 
           * 1. Replicate (Stable Diffusion) - LOWEST COST OPTION
           *    - Cost: ~$0.002-0.003 per image (Stable Diffusion XL)
           *    - Quality: Good for product mockups
           *    - Speed: ~5-10 seconds per image
           *    - API: https://replicate.com/docs/api
           *    - Endpoint: https://api.replicate.com/v1/predictions
           *    - Request: { version: "model-version", input: { prompt, width: 1024, height: 1024 } }
           * 
           * 2. DALL-E 3 (OpenAI) - HIGHEST QUALITY, HIGHER COST
           *    - Cost: ~$0.040 per image (1024x1024)
           *    - Quality: Excellent, best for professional mockups
           *    - Speed: ~10-20 seconds
           *    - API: https://platform.openai.com/docs/guides/images
           *    - Endpoint: https://api.openai.com/v1/images/generations
           *    - Request: { model: "dall-e-3", prompt, n: 1, size: "1024x1024" }
           * 
           * 3. Stability AI (Stable Diffusion) - GOOD BALANCE
           *    - Cost: ~$0.004 per image
           *    - Quality: Very good
           *    - Speed: ~3-8 seconds
           *    - API: https://platform.stability.ai/docs/api-reference
           *    - Endpoint: https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image
           *    - Request: { text_prompts: [{ text: prompt }], cfg_scale: 7, width: 1024, height: 1024 }
           * 
           * 4. Hugging Face Inference API - FREE TIER AVAILABLE
           *    - Cost: Free tier available, then pay-per-use
           *    - Quality: Good (depends on model)
           *    - Speed: Variable
           *    - API: https://huggingface.co/docs/api-inference
           * 
           * To switch providers, update the code below and add the appropriate API key to .env.local
           */
          
          const customApiUrl = process.env.NANOBANANA_API_URL
          
          // Use Gemini Nano Banana (Flash 3) by default
          if (customApiUrl) {
            // Use custom endpoint if provided (for other providers)
            const response = await fetch(customApiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
              },
              body: JSON.stringify({ prompt: prompt }),
            })
            
            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`Custom API error: ${errorText}`)
            }
            
            const imageData = await response.json()
            // Handle custom API response format (adjust based on provider)
            // ... (continue with image processing)
          } else {
            // DEFAULT: Google Gemini Nano Banana (Flash 3)
            const ai = new GoogleGenAI({ apiKey })
            
            // Use gemini-2.5-flash-image for speed, or gemini-3-pro-image-preview for quality
            const model = "gemini-2.5-flash-image" // Fast version
            // Alternative: "gemini-3-pro-image-preview" for better quality
            
            // Generate content with configuration for variation
            // Note: Gemini image generation doesn't support temperature directly,
            // but we add randomness to the prompt and use generation config if available
            const result = await ai.models.generateContent({
              model,
              contents: prompt,
              // Add generation config for more variation (if supported by the API)
              generationConfig: {
                // Some models support seed for variation
                // temperature: 1.0, // Not available for image generation
                // topK: 40, // Not available for image generation
                // topP: 0.95, // Not available for image generation
              },
            } as any)
            
            // Extract image from response
            // The response structure may vary, check candidates or direct response
            const response = (result as any).response || result
            const candidates = response?.candidates || (result as any).candidates
            
            if (!candidates || candidates.length === 0) {
              throw new Error("No image generated - check API response format")
            }
            
            // Get the first candidate's content
            const content = candidates[0].content
            const parts = content?.parts || []
            
            if (parts.length === 0) {
              throw new Error("No image data in response")
            }
            
            // Find the first image part (inline data) - only process one image
            const imagePart = parts.find((part: any) => part.inlineData)
            
            if (!imagePart || !imagePart.inlineData) {
              throw new Error("No image data found in response")
            }
            
            // Convert base64 to buffer - only process the first image
            const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64")
            
            // Upload to Supabase Storage - organized by team folders
            // Generate unique ID: timestamp + random string for uniqueness
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            const fileName = `jersey-${uniqueId}.png`
            const filePath = `teams/${team.id}/jerseys/${fileName}`
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("assets")
              .upload(filePath, imageBuffer, {
                contentType: "image/png",
                upsert: false,
              })

            if (uploadError) {
              console.error("Supabase storage upload error:", {
                error: uploadError,
                filePath,
                bucket: "assets",
                teamId: team.id,
              })
              return NextResponse.json(
                { error: `Failed to upload image: ${uploadError.message}`, details: uploadError },
                { status: 500 }
              )
            }

            if (!uploadData) {
              console.error("Upload succeeded but no data returned:", { filePath })
              return NextResponse.json(
                { error: "Upload succeeded but no data returned" },
                { status: 500 }
              )
            }

            console.log("Image uploaded successfully:", { 
              filePath, 
              path: uploadData.path,
              id: uploadData.id,
              fullPath: uploadData.fullPath 
            })

            // Verify the file was actually uploaded by checking if it exists
            const { data: fileCheck, error: checkError } = await supabase.storage
              .from("assets")
              .list(`teams/${team.id}/jerseys`, {
                limit: 100,
                search: fileName,
              })

            if (checkError) {
              console.warn("Could not verify file upload:", checkError)
            } else {
              const fileExists = fileCheck?.some(file => file.name === fileName)
              if (!fileExists) {
                console.error("File uploaded but not found in storage:", { fileName, filePath, fileCheck })
                return NextResponse.json(
                  { error: "File upload verification failed - file not found in storage" },
                  { status: 500 }
                )
              }
              console.log("File upload verified:", fileName)
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from("assets")
              .getPublicUrl(filePath)

            if (!urlData?.publicUrl) {
              console.error("Failed to get public URL:", { filePath, urlData })
              return NextResponse.json(
                { error: "Failed to get public URL for uploaded image" },
                { status: 500 }
              )
            }

            assetUrl = urlData.publicUrl
            assetName = assetName || `Jersey Mockup - ${team.name}${sponsorName ? ` x ${sponsorName}` : ""}`
            
            console.log("Asset URL set:", assetUrl)
          }
        } catch (error: any) {
          console.error("Jersey generation error:", error)
          return NextResponse.json(
            { error: `Failed to generate jersey: ${error.message}` },
            { status: 500 }
          )
        }
      } catch (error: any) {
        console.error("Jersey generation error:", error)
        return NextResponse.json(
          { error: `Failed to generate jersey: ${error.message}` },
          { status: 500 }
        )
      }
    }

    // Ensure we have a valid URL
    if (!assetUrl) {
      return NextResponse.json(
        { error: "Failed to upload or generate asset. No URL available." },
        { status: 500 }
      )
    }

    const asset = {
      teamId: team.id,
      type,
      name: assetName || `${type} - ${new Date().toLocaleDateString()}`,
      url: assetUrl,
    }

    // Save to database
    const dbAsset = assetToDbAsset(asset, team.id)
    const { data: insertedAsset, error: insertError } = await supabase
      .from("assets")
      .insert(dbAsset)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      asset: dbAssetToAsset(insertedAsset),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get("id")

    if (!assetId) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Get the asset to check ownership and get the file path
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("*")
      .eq("id", assetId)
      .eq("team_id", team.id)
      .single()

    if (assetError || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Delete from Supabase Storage if it's a storage URL
    if (asset.url && asset.url.includes("/storage/v1/object/public/assets/")) {
      // Extract the file path from the URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/assets/teams/{team_id}/jerseys/filename.png
      // or legacy: https://[project].supabase.co/storage/v1/object/public/assets/jerseys/filename.png
      const urlParts = asset.url.split("/storage/v1/object/public/assets/")
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        const { error: storageError } = await supabase.storage
          .from("assets")
          .remove([filePath])

        if (storageError) {
          console.error("Error deleting from storage:", storageError)
          // Continue with database deletion even if storage deletion fails
        }
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("assets")
      .delete()
      .eq("id", assetId)
      .eq("team_id", team.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
