import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase.config";
import { toast } from "sonner";

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  restaurantId,
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isThere, setIsThere] = useState(false);

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setCategory(product.category);
      setPrice(product.price.toString());
      setPreviewImage(product.img);
      setImageUrl(product.img);
      setIsThere(product.isThere); // Initialize from product property
    }
  }, [product]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Rasm hajmi 10MB dan kichik bo'lishi kerak");
      return;
    }

    setPreviewImage(URL.createObjectURL(file));
    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setImageUrl(data.data.link);
      toast.success("Rasm muvaffaqiyatli yuklandi!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(
        error.message === "Rate limit exceeded. Please try again later."
          ? "Rasm yuklash cheklangan. Iltimos keyinroq urinib ko'ring."
          : "Rasmni yuklashda xatolik yuz berdi. Qaytadan urinib ko'ring."
      );
      toast.error("Rasmni yuklashda xatolik!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    try {
      const restaurantRef = doc(db, "restaurants", restaurantId);

      const updatedProduct = {
        ...product,
        title,
        category,
        price: Number(price),
        img: imageUrl,
        isThere,
      };

      await updateDoc(restaurantRef, {
        menu: arrayRemove(product),
      });
      await updateDoc(restaurantRef, {
        menu: arrayUnion(updatedProduct),
      });

      toast.success("Mahsulot muvaffaqiyatli o'zgartirildi!");
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Mahsulotni o'zgartirishda xatolik!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Mahsulotni o'zgartirish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Product Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
          />
          <Input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
          />
          <Input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
          />
          <div className="flex items-center space-x-4">
            <label className="text-gray-400">Mahsulot mavjudmi?</label>
            <input
              type="checkbox"
              checked={isThere}
              onChange={(e) => setIsThere(e.target.checked)}
              className="h-5 w-5 text-teal-500 border-gray-600 bg-gray-700"
            />
          </div>
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Mahsulot surati
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-gray-700 text-white border-gray-600"
              disabled={isUploading}
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-4 w-32 h-32 object-cover rounded"
              />
            )}
            {isUploading && (
              <p className="text-yellow-400 mt-2">Yuklanmoqda...</p>
            )}
            {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
          </div>
          <Button
            type="submit"
            className="bg-teal-500 hover:bg-teal-600 text-white"
            disabled={isUploading}
          >
            O'zgartirish
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
