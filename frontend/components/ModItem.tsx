import { cn } from '@/lib/utils';
import { getImgURL } from '@/utils';
import { fs } from '@/wailsjs/wailsjs/go/models';
import { SwitchModStatus } from '@/wailsjs/wailsjs/go/main/App';
import { toast } from 'sonner';
import { useAlertDialog } from "@/stores/useAlert";


const ModItem = ({ mod, getCharMods }: { mod: fs.ModInfo, getCharMods: () => void }) => {
  const isEnabled = mod.Name.toLowerCase().startsWith('disabled ') ? false : true
  const { setAlert } = useAlertDialog();

  const handleClick = () => {
    SwitchModStatus(mod.Path)
      .then(() => getCharMods())
      .catch((e: any) => {
        setAlert({
          title: '에러남',
          description: e.toString()
        })
      })
  }

  return (
    <div
      key={mod.Name}
      className={cn(
        "shadow dark:shadow-none",
        "rounded-2xl overflow-hidden relative duration-300",
        isEnabled ? 'bg-green-500/50' : 'bg-red-500/50'
      )}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="font-medium mb-2">
          {mod.Name.replace(/^disabled\s*/i, '')}
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
  )
}


export default ModItem