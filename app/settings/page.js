"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Edit, Loader2 } from "lucide-react";
import { db } from "@/firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { id } = useUser();
  const router = useRouter();

  const [settings, setSettings] = useState({
    banner: "",
    name: "",
    category: [],
    workTime: { opens: "", closes: "" },
    deliveryPrice: 0,
    city: null,
    location: null,
  });
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    "Fast-Food",
    "Milliy taomlar",
    "Go'shtli taomlar",
    "Dorixona",
    "Texnikalar",
    "Shirinliklar",
  ];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function (position) {
      if (position) {
        setLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        });
      }
    });
  }, [id]);

  const updateLocation = async () => {
    if (location && id) {
      updateDoc(doc(db, "restaurants", id), {
        location,
      });
    }
  };

  useEffect(() => {
    if (id !== undefined) {
      if (id === null) {
        router.push("/login");
        return;
      }

      const fetchSettings = async () => {
        try {
          const docRef = doc(db, "restaurants", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSettings({
              banner: data.banner || "",
              name: data.name || "",
              category: data.category || [],
              workTime: {
                opens: data.workTime?.opens || "",
                closes: data.workTime?.closes || "",
              },
              deliveryPrice: data.deliveryPrice || 0,
              city: data.city || null,
              location: data.location || null,
            });
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching settings:", error);
          toast({
            title: "Error",
            description: "Failed to load settings. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      };

      fetchSettings();
    }
  }, [id, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setSettings((prev) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter((item) => item !== category)
        : [...prev.category, category],
    }));
  };

  const handleWorkingHoursChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      workTime: {
        ...prev.workTime,
        [name]: value === "00:00" ? "23:59" : value,
      },
    }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to upload image");
      }

      const downloadURL = response.data.data.link;
      setSettings((prev) => ({ ...prev, banner: downloadURL }));
      await updateDoc(doc(db, "restaurants", id), { banner: downloadURL });
      toast({
        title: "Success",
        description: "Banner updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast({
        title: "Error",
        description: "Failed to upload banner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateDoc(doc(db, "restaurants", id), {
        name: settings.name,
        category: settings.category,
        workTime: settings.workTime,
        deliveryPrice: Number(settings.deliveryPrice),
        city: settings.city,
      });
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (id === null || id === undefined) {
    return null;
  }

  return (
    <>
      <header>
        <title>Oxa Admin | Sozlamalar</title>
      </header>

      <main className="p-8 max-lg:py-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            <div className="w-full py-20">
              <div className="flex gap-10 max-lg:flex-col">
                <div className="flex-1 w-full h-[28rem] rounded-xl overflow-hidden relative">
                  <Label
                    htmlFor="banner-upload"
                    className="absolute bg-gray-700 hover:bg-gray-600 p-2 rounded-lg right-2 top-2 cursor-pointer duration-200 flex items-center gap-2"
                  >
                    <Edit className="w-6 h-6 text-white" />
                    {!settings?.banner && (
                      <span className="text-white text-lg">
                        {settings?.banner ? "O'zgartirish" : "Rasm o'rnating"}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                    disabled={isSaving}
                  />
                  <img
                    src={settings?.banner || "/images/placeholder.webp"}
                    alt="banner"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between p-5 pb-7 rounded-xl h-[28rem] bg-gray-800 text-white border-gray-700 max-lg:gap-10">
                  <div>
                    <Label htmlFor="name" className="text-lg">
                      Nomi
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={settings.name}
                      onChange={handleInputChange}
                      className="bg-gray-700 text-white border-gray-600 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <span className="text-lg block mb-2">Kategoriyalar</span>
                    <div className="flex flex-wrap gap-x-10 gap-y-2 mt-2">
                      {categories.map((cat) => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox
                            id={cat}
                            checked={settings.category.includes(
                              cat.toLocaleLowerCase()
                            )}
                            onCheckedChange={() =>
                              handleCategoryChange(cat.toLocaleLowerCase())
                            }
                          />
                          <label
                            htmlFor={cat}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-lg block">Ish vaqti</span>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor="opens">Ochilish</Label>
                        <Input
                          id="opens"
                          type="time"
                          name="opens"
                          value={settings.workTime.opens}
                          onChange={handleWorkingHoursChange}
                          className="bg-gray-700 text-white border-gray-600 focus:border-teal-500"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="closes">Yopilish</Label>
                        <Input
                          id="closes"
                          type="time"
                          name="closes"
                          value={settings.workTime.closes}
                          onChange={handleWorkingHoursChange}
                          className="bg-gray-700 text-white border-gray-600 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deliveryPrice" className="text-lg">
                      Yetkazib berish narxi (km)
                    </Label>
                    <Input
                      id="deliveryPrice"
                      name="deliveryPrice"
                      type="number"
                      value={settings.deliveryPrice}
                      onChange={handleInputChange}
                      className="bg-gray-700 text-white border-gray-600 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex max-sm:flex-col justify-between items-center p-5 rounded-xl bg-gray-800 text-white border-gray-700 max-lg:gap-10 mt-4">
                <div className="flex items-center gap-5">
                  <Label htmlFor="address" className="text-lg">
                    Lokatsiya
                  </Label>
                  <Button
                    onClick={updateLocation}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    O'zgartirish
                  </Button>
                </div>

                <div className="flex items-center gap-5">
                  <Label htmlFor="city" className="text-lg">
                    Shahar
                  </Label>
                  <Select
                    value={settings.city || ""}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, city: value }))
                    }
                  >
                    <SelectTrigger className="w-[180px] bg-gray-700 text-white border-gray-600">
                      <SelectValue placeholder="Shahar tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 text-white border-gray-600">
                      <SelectItem value="G'ijduvon">G'ijduvon</SelectItem>
                      <SelectItem value="Vobkent">Vobkent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saqlash
                    </>
                  ) : (
                    "Saqlash"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
