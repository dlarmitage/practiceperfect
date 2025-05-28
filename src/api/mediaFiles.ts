/**
 * API handler to fetch media files from the public/media directory
 * This is used by the HeroSlider component to dynamically load hero images
 */

// This would typically be handled by a server-side API,
// but for client-side only applications, we can use this approach
export async function getMediaFiles(): Promise<string[]> {
  try {
    // In a real production environment, this would be a server API call
    // For now, we'll use a static list that can be updated as new images are added
    const mediaFiles = [
      'actor.webp',
      'batter.webp',
      'coder.webp',
      'martial_art.webp',
      'painter.webp',
      'pianist.webp',
      'runner.webp',
      'violinist.webp'
      // Add new files here as they are added to the public/media folder
    ];
    
    // Filter to only include files that actually exist
    const existingFiles = await Promise.all(
      mediaFiles.map(async (filename) => {
        try {
          const response = await fetch(`/media/${filename}`, { method: 'HEAD' });
          return response.ok ? filename : null;
        } catch {
          return null;
        }
      })
    );
    
    return existingFiles.filter(Boolean) as string[];
  } catch (error) {
    console.error('Error fetching media files:', error);
    return [];
  }
}
