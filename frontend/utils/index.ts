import { DeleteFolder, OpenFolder } from '@/wailsjs/wailsjs/go/main/App';

export const getImgURL = (imgPath: string) => {
  return 'http://localhost:24312/api/img?path=' + imgPath
}

export const openFolder = async (path: string) => {
  await OpenFolder(path);
}

export const deleteFolder = async (path: string) => {
  await DeleteFolder(path);
}