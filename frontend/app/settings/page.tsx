'use client'

import { Button } from "@/components/ui/button";
import { FolderIcon } from "lucide-react";
import {
  GetModRootPath,
  SaveModRootPath,
  SelectDirectory,
  GetTheme,
  SaveTheme,
  GetModFolders
} from '@/wailsjs/wailsjs/go/main/App';
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes"
import { useModsStore } from "@/stores/useModsStore";
import { useAlertDialog } from "@/stores/useAlert";


export default function SettingsPage() {
  const { systemTheme, theme, setTheme } = useTheme()
  const { dirs, isLoading, setDirs, setIsLoading } = useModsStore()
  const { alert, setAlert, setIsOpen } = useAlertDialog();

  const [selectedPath, setSelectedPath] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const fetchMods = async () => {
    try {
      setIsLoading(true)
      if (await GetModRootPath()) {
        const modFolders = await GetModFolders()
        setDirs(modFolders)
      }
    } catch (e: any) {
      setAlert({
        title: "모드 폴더 가져오기 실패",
        description: e
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadSavedPath = async () => {
      try {
        const savedPath = await GetModRootPath();
        const theme = await GetTheme();
        if (savedPath) setSelectedPath(savedPath);
        if (theme) setIsDarkMode(theme === 'dark');
      } catch (e: any) {
        toast.error('Failed to load saved path', {
          description: e.message
        });
      }
    };

    loadSavedPath();
  }, []);

  const selectDir = async () => {
    try {
      const selectedDir = await SelectDirectory();
      if (selectedDir) {
        await SaveModRootPath(selectedDir);
        setSelectedPath(selectedDir);
        await fetchMods();
        toast.success('경로가 저장되었습니다', { description: selectedDir, duration: 2000 });
      }
    } catch (e: any) {
      toast.error('Failed to select mod path', {
        description: e.message
      });
    }
  }

  const toggleTheme = async () => {
    try {
      await SaveTheme(isDarkMode ? 'light' : 'dark');
      setTheme(isDarkMode ? 'light' : 'dark');
      setIsDarkMode(!isDarkMode);
    } catch (e: any) {
      toast.error('Failed to toggle theme', {
        description: e.message
      });
    }
  }

  return (
    <div className="w-full h-full">
      <div className="mb-12">
        <h1 className="text-3xl">Settings</h1>
      </div>
      <div className="mb-12">
        <h2 className="text-2xl mb-3 ms-4">Paths</h2>
        <div className="flex justify-between w-full items-center border rounded-xl p-6">
          <div className="flex flex-col gap-1">
            <p className="text-xl">Select mod root folder</p>
            <p>{selectedPath || 'Plase select...'}</p>
          </div>
          <Button variant="outline" onClick={selectDir}>
            <FolderIcon />
          </Button>
        </div>
      </div>
      <div>
        <h2 className="text-2xl mb-3 ms-4">Options</h2>
        <div className="flex justify-between w-full items-center border rounded-xl p-6">
          <div className="flex flex-col gap-1">
            <p className="text-xl">Dark mode</p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              className="outline outline-2 outline-offset-2"
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
              id="theme-toggle"
            />
            {/* <Label htmlFor="airplane-mode">Airplane Mode</Label> */}
          </div>
        </div>
      </div>
    </div>
  )
}