/**
 * Jersey Mockup Generation Prompt
 * 
 * Customize this prompt to control how jersey mockups are generated.
 * The prompt will be used with nanobanana to generate jersey images.
 * 
 * Available variables:
 * - {teamName} - The team's name
 * - {primaryColor} - Team's primary color (hex)
 * - {secondaryColor} - Team's secondary color (hex)
 * - {sponsorName} - Sponsor company name (if applicable)
 */

export const JERSEY_MOCKUP_PROMPT_OLD = `
Create a professional sports jersey mockup for {teamName}.
The jersey should have:
- Primary color: {primaryColor}
- Secondary/Accent color: {secondaryColor}
- Team name "{teamName}" prominently displayed
- Sponsor logo placement area for "{sponsorName}" (if provided)
- Modern, clean design suitable for youth sports
- High quality, photorealistic rendering
- Professional sports jersey style with proper fit and fabric texture
`.trim()

export const JERSEY_MOCKUP_PROMPT = `Task: Create a realistic sponsorship mockup that feels local and authentic.

You are given:

Image A: a photo of {teamName}'s current soccer jersey (use this as the base image)
- The jersey should feature the team's primary color: {primaryColor}
- Secondary/accent color: {secondaryColor}
- Team name "{teamName}" should be visible on the jersey

Image B: the potential sponsor's logo for {sponsorName} (apply to the jersey)

Non-negotiable preservation rules:

Do NOT remove, alter, blur, repaint, relocate, or cover any existing jersey elements, especially:
- the club crest/logo on the left chest
- manufacturer logo, patterns, stripes, badges, numbers, collar details
- The team name "{teamName}" and any existing design elements

The only allowed change to the jersey is adding Image B (the {sponsorName} logo) as the sponsor.

Edit scope (only one change region):

Apply edits only to the center chest sponsor area (main sponsor zone).
Keep at least 5–8 cm (2–3 inches) clear space from the left-chest crest.

Sponsor placement:

Place the {sponsorName} logo (Image B) centered on the chest, horizontally aligned.
Size: about 60–70% of chest width (scale down if crowded).
Preserve the sponsor logo's exact colors, proportions, and shape—no redesign.

Realism requirements:

Make the {sponsorName} sponsor logo look professionally applied (heat-transfer print):
- Match the jersey's lighting, shadows, and fabric texture
- Add subtle fabric wrinkles through the logo (realistic, but keep it readable)
- Keep edges crisp; no warping or melting artifacts
- Ensure the logo integrates naturally with the {primaryColor} and {secondaryColor} jersey colors

Background (local business vibe):

Replace the background with a softly blurred local soccer field / turf scene (authentic community vibe).
Use shallow depth of field so the jersey is sharp and the background is out of focus.
Keep it daytime / golden-hour natural light, not dramatic stadium lighting.
No crowds, no big pro stadium, no distracting signage.

Output:

Produce one high-quality, modern, photorealistic image of the {teamName} jersey with the {sponsorName} sponsor logo.
No additional text, no watermarks, no extra logos.`

/**
 * Get the formatted prompt with team details
 */
export function getJerseyPrompt(params: {
  teamName: string
  primaryColor: string
  secondaryColor: string
  sponsorName?: string
}): string {
  let prompt = JERSEY_MOCKUP_PROMPT
    .replace(/{teamName}/g, params.teamName)
    .replace(/{primaryColor}/g, params.primaryColor)
    .replace(/{secondaryColor}/g, params.secondaryColor)
  
  if (params.sponsorName) {
    prompt = prompt.replace(/{sponsorName}/g, params.sponsorName)
  } else {
    // Remove sponsor-specific references if no sponsor is provided
    prompt = prompt.replace(/for {sponsorName}/g, '')
    prompt = prompt.replace(/the {sponsorName} logo/g, 'the sponsor logo')
    prompt = prompt.replace(/\(the {sponsorName} logo\)/g, '')
    prompt = prompt.replace(/the {sponsorName} sponsor logo/g, 'the sponsor logo')
    prompt = prompt.replace(/with the {sponsorName} sponsor logo/g, '')
  }
  
  return prompt.trim()
}
