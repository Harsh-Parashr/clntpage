import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./config";

export async function uploadFile(file, path) {
  try {
    const storage = getStorage(app);
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function uploadProfilePicture(file) {
  return uploadFile(file, 'profile-pictures');
}