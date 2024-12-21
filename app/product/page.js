"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doc, onSnapshot, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/firebase.config";
import { useUser } from "@/context/UserContext";
import AddProductModal from "@/components/addProductModal";
import EditProductModal from "@/components/editProductModal";
import ConfirmationDialog from "@/components/confirmationDialog";

export default function Product() {
  const { id } = useUser();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (id !== undefined) {
      if (id === null) {
        router.push("/login");
        return;
      }

      const restaurantRef = doc(db, "restaurants", id);
      const unsubscribe = onSnapshot(restaurantRef, (doc) => {
        if (doc.exists()) {
          const restaurantData = doc.data();
          const menuProducts = restaurantData.menu || [];
          setProducts(menuProducts);

          const uniqueCategories = [
            ...new Set(menuProducts.map((product) => product.category)),
          ];
          setCategories(uniqueCategories);
        }
      });

      return () => unsubscribe();
    }
  }, [id, router]);

  if (id === null || id === undefined) {
    return null;
  }

  const filteredProducts = products.filter(
    (product) =>
      (product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "all" ||
        product.category === categoryFilter ||
        (categoryFilter === "notThere" && !product.isThere))
  );

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const restaurantRef = doc(db, "restaurants", id);
      await updateDoc(restaurantRef, {
        menu: arrayRemove(productToDelete),
      });
      setProductToDelete(null); // Reset after deletion
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsConfirmDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <header>
        <title>Oxa Admin | Mahsulotlar</title>
      </header>

      <main className="flex-1 p-8">
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Mahsulotni qidirish"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 text-white border-gray-700 focus:border-teal-500 w-full"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <Select onValueChange={setCategoryFilter} value={categoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-800 text-white border-gray-700">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                <SelectItem value="all">Barcha mahsulotlar</SelectItem>
                <SelectItem value="notThere">Tugagan mahsulotlar</SelectItem>
                {categories.length !== 0 &&
                  categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto duration-200"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="text-base leading-3">Mahsulot qo'shish</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="bg-gray-800 text-white border-gray-700"
            >
              <CardHeader>
                <img
                  src={product.img}
                  alt={product.title}
                  className="w-full h-36 object-cover rounded-lg"
                />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl mb-2">{product.title}</CardTitle>
                <p className="text-gray-400 mb-1">{product.category}</p>
                <div className="flex items-center gap-2">
                  <p className="text-teal-500 font-bold">
                    {product.price} so'm
                  </p>
                  {!product.isThere && <span>| Tugagan</span>}
                </div>
              </CardContent>
              <CardFooter className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-gray-800"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent text-red-500 border-red-500 hover:bg-red-500 hover:text-gray-800"
                  onClick={() => handleDeleteClick(product)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            Bunday mahsulotlar mavjud emas
          </div>
        )}

        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          restaurantId={id}
        />

        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          restaurantId={id}
        />

        <ConfirmationDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Mahsulotni o'chirish"
          message="Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?"
        />
      </main>
    </>
  );
}
