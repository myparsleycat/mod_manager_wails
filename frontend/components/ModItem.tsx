import { cn } from '@/lib/utils';
import { deleteFolder, getImgURL, openFolder } from '@/utils';
import { fs } from '@/wailsjs/wailsjs/go/models';
import { SwitchModStatus } from '@/wailsjs/wailsjs/go/main/App';
import { useAlertDialog } from "@/stores/useAlert";
import { FolderIcon, TrashIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useState } from 'react';


const ModItem = ({ mod, getCharMods }: { mod: fs.ModInfo, getCharMods: () => void }) => {
  const { setAlert } = useAlertDialog();
  const isEnabled = mod.Name.toLowerCase().startsWith('disabled ') ? false : true
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    SwitchModStatus(mod.Path)
      .then(() => getCharMods())
      .catch((e: any) => {
        setAlert({
          title: 'Switch Mod Status Failed',
          description: e.toString()
        })
      })
  }

  const handleFolderClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    openFolder(mod.Path)
      .catch((e: any) => {
        setAlert({
          title: 'Open Folder Failed',
          description: e.toString()
        })
      })
  }

  const handleDelete = async () => {
    deleteFolder(mod.Path)
      .then(() => getCharMods())
      .catch((e: any) => {
        setAlert({
          title: 'Delete Mod Failed',
          description: e.toString()
        })
      })
  }

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 모드를 삭제할까요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        key={mod.Name}
        className={cn(
          "shadow dark:shadow-none",
          "rounded-lg overflow-hidden relative duration-300",
          isEnabled ? 'bg-green-500/50' : 'bg-red-500/50'
        )}
        onClick={handleClick}
      >
        <div className="p-3">
          <div className="flex justify-between items-center font-medium mb-2 gap-2">
            <p className='truncate text-base'>
              {mod.Name.replace(/^disabled\s*/i, '')}
            </p>
            <div className='flex gap-2'>
              <button
                className='p-1.5 border border-current rounded-lg'
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <TrashIcon size={18} />
              </button>
              <button
                className='p-1.5 border border-current rounded-lg'
                onClick={handleFolderClick}
              >
                <FolderIcon size={18} />
              </button>
            </div>
          </div>
          <div className="aspect-video">
            {mod.Preview.Path && (
              <img
                src={getImgURL(mod.Preview.Path)}
                alt={`Preview of ${mod.Name}`}
                className="w-full h-full object-cover rounded"
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}


export default ModItem