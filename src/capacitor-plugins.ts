import { registerPlugin } from '@capacitor/core';
import { 
  Camera, 
  CameraResultType, 
  CameraSource,
  Photo 
} from '@capacitor/camera';
import { 
  Share,
  ShareOptions 
} from '@capacitor/share';
import { 
  Filesystem,
  Directory,
  Encoding 
} from '@capacitor/filesystem';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

// Export all Capacitor plugins for use in the app
export {
  Camera,
  CameraResultType,
  CameraSource,
  Share,
  Filesystem,
  Directory,
  Encoding,
  Haptics,
  ImpactStyle,
  StatusBar,
  Style,
  SplashScreen,
  Keyboard
};

export type { Photo, ShareOptions };

// Initialize app-specific settings
export const initializeApp = async () => {
  try {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FF9933' });
    
    // Hide splash screen after app loads
    await SplashScreen.hide();
    
    console.log('Capacitor app initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor app:', error);
  }
};

// Utility functions for mobile features
export const shareContent = async (options: ShareOptions) => {
  try {
    await Share.share(options);
  } catch (error) {
    console.error('Error sharing content:', error);
  }
};

export const takePicture = async (): Promise<Photo | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    return image;
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
};

export const selectFromGallery = async (): Promise<Photo | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });
    return image;
  } catch (error) {
    console.error('Error selecting from gallery:', error);
    return null;
  }
};

export const vibrate = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    console.error('Error with haptic feedback:', error);
  }
};