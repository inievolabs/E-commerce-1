import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Product } from "@/data/products";

import { useAuth } from "@/lib/auth";

import {

  categoryToDbRow,

  fetchAdminCategories,

  fetchAdminInventory,

  fetchAdminMedia,

  fetchAdminOrders,

  fetchAdminPostCategories,

  fetchAdminPosts,

  fetchAdminProducts,

  postCategoryToDbRow,

  postToDbRow,

  productToDbRow,

} from "@/lib/admin-api";

import {

  ADMIN_QUERY_KEYS,

  CATALOG_QUERY_KEY,

  type CategoryDef,

  type InventoryRecord,

  type MediaItem,

  type Order,

  type OrderStatus,

  type Post,

  type PostCategory,

} from "@/lib/admin-types";

import { createSupabaseBrowserClient } from "@/lib/supabase";



export type {

  Product,

  Category,

  Gender,

  CategoryDef,

  InventoryRecord,

  OrderStatus,

  OrderLine,

  Order,

  PostCategory,

  Post,

  MediaItem,

} from "@/lib/admin-types";



interface AdminState {

  products: Product[];

  categories: CategoryDef[];

  inventory: Record<string, InventoryRecord>;

  orders: Order[];

  media: MediaItem[];

  posts: Post[];

  postCategories: PostCategory[];

  isLoading: boolean;

}



interface AdminContextValue extends AdminState {

  upsertProduct: (p: Product) => void;

  deleteProduct: (id: string) => void;

  setProductImages: (id: string, images: string[]) => void;

  upsertCategory: (c: CategoryDef) => void;

  deleteCategory: (id: string) => void;

  setStock: (productId: string, stock: number) => void;

  setThreshold: (productId: string, threshold: number) => void;

  adjustStock: (productId: string, delta: number) => void;

  addOrder: (o: Omit<Order, "id" | "createdAt" | "status"> & { status?: OrderStatus }) => Order;

  setOrderStatus: (id: string, status: OrderStatus) => void;

  deleteOrder: (id: string) => void;

  addMedia: (m: Omit<MediaItem, "id" | "createdAt" | "productIds"> & { productIds?: string[] }) => MediaItem;

  deleteMedia: (id: string) => void;

  renameMedia: (id: string, name: string) => void;

  setMediaProducts: (id: string, productIds: string[]) => void;

  upsertPost: (p: Post) => void;

  deletePost: (id: string) => void;

  upsertPostCategory: (c: PostCategory) => void;

  deletePostCategory: (id: string) => void;

}



const AdminContext = createContext<AdminContextValue | null>(null);



export function AdminStoreProvider({ children }: { children: ReactNode }) {

  const queryClient = useQueryClient();

  const { isAdmin } = useAuth();

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);



  const productsQuery = useQuery({

    queryKey: ADMIN_QUERY_KEYS.products,

    queryFn: fetchAdminProducts,

    staleTime: 30_000,

  });



  const categoriesQuery = useQuery({

    queryKey: ADMIN_QUERY_KEYS.categories,

    queryFn: fetchAdminCategories,

    staleTime: 60_000,

  });



  const inventoryQuery = useQuery({

    queryKey: ADMIN_QUERY_KEYS.inventory,

    queryFn: fetchAdminInventory,

    staleTime: 15_000,

  });



  const ordersQuery = useQuery({

    queryKey: ADMIN_QUERY_KEYS.orders,

    queryFn: fetchAdminOrders,

    enabled: isAdmin,

    staleTime: 15_000,

  });



  const postsQuery = useQuery({

    queryKey: ADMIN_QUERY_KEYS.posts,

    queryFn: fetchAdminPosts,

    staleTime: 30_000,

  });



  const postCategoriesQuery = useQuery({

    queryKey: ADMIN_QUERY_KEYS.postCategories,

    queryFn: fetchAdminPostCategories,

    staleTime: 60_000,

  });



  const mediaQuery = useQuery({

    queryKey: ADMIN_QUERY_KEYS.media,

    queryFn: fetchAdminMedia,

    enabled: isAdmin,

    staleTime: 30_000,

  });



  const invalidateCatalog = () => {

    void queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });

  };



  const productMut = useMutation({

    mutationFn: async (p: Product) => {

      const { error } = await supabase.from("products").upsert(productToDbRow(p));

      if (error) throw error;

      const stock = p.stock ?? 0;

      const { error: invErr } = await supabase.from("inventory").upsert({

        product_id: p.id,

        stock: Math.max(0, stock),

        low_stock_threshold: inventoryQuery.data?.[p.id]?.lowStockThreshold ?? 4,

      });

      if (invErr) throw invErr;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.products });

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.inventory });

      invalidateCatalog();

    },

  });



  const deleteProductMut = useMutation({

    mutationFn: async (id: string) => {

      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.products });

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.inventory });

      invalidateCatalog();

    },

  });



  const setProductImagesMut = useMutation({

    mutationFn: async ({ id, images }: { id: string; images: string[] }) => {

      const { error } = await supabase.from("products").update({ images }).eq("id", id);

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.products });

      invalidateCatalog();

    },

  });



  const categoryMut = useMutation({

    mutationFn: async (c: CategoryDef) => {

      const { error } = await supabase.from("categories").upsert(categoryToDbRow(c));

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.categories });

    },

  });



  const deleteCategoryMut = useMutation({

    mutationFn: async (id: string) => {

      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.categories });

    },

  });



  const setStockMut = useMutation({

    mutationFn: async ({ productId, stock }: { productId: string; stock: number }) => {

      const { error } = await supabase

        .from("inventory")

        .upsert({ product_id: productId, stock: Math.max(0, stock) });

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.inventory });

    },

  });



  const setThresholdMut = useMutation({

    mutationFn: async ({ productId, threshold }: { productId: string; threshold: number }) => {

      const cur = inventoryQuery.data?.[productId];

      const { error } = await supabase.from("inventory").upsert({

        product_id: productId,

        stock: cur?.stock ?? 0,

        low_stock_threshold: Math.max(0, threshold),

      });

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.inventory });

    },

  });



  const orderStatusMut = useMutation({

    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {

      const { error } = await supabase.from("orders").update({ status }).eq("id", id);

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.orders });

    },

  });



  const deleteOrderMut = useMutation({

    mutationFn: async (id: string) => {

      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.orders });

    },

  });



  const postMut = useMutation({

    mutationFn: async (p: Post) => {

      const { error } = await supabase.from("posts").upsert(postToDbRow(p));

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.posts });

    },

  });



  const deletePostMut = useMutation({

    mutationFn: async (id: string) => {

      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.posts });

    },

  });



  const postCategoryMut = useMutation({

    mutationFn: async (c: PostCategory) => {

      const { error } = await supabase.from("post_categories").upsert(postCategoryToDbRow(c));

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.postCategories });

    },

  });



  const deletePostCategoryMut = useMutation({

    mutationFn: async (id: string) => {

      const { error } = await supabase.from("post_categories").delete().eq("id", id);

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.postCategories });

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.posts });

    },

  });



  const mediaMut = useMutation({

    mutationFn: async (item: MediaItem) => {

      const { error } = await supabase.from("media_assets").upsert({

        id: item.id,

        name: item.name,

        url: item.url,

        width: item.width,

        height: item.height,

        product_ids: item.productIds,

      });

      if (error) throw error;

      return item;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.media });

    },

  });



  const deleteMediaMut = useMutation({

    mutationFn: async (id: string) => {

      const { error } = await supabase.from("media_assets").delete().eq("id", id);

      if (error) throw error;

    },

    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.media });

    },

  });



  const state: AdminState = {

    products: productsQuery.data ?? [],

    categories: categoriesQuery.data ?? [],

    inventory: inventoryQuery.data ?? {},

    orders: ordersQuery.data ?? [],

    media: mediaQuery.data ?? [],

    posts: postsQuery.data ?? [],

    postCategories: postCategoriesQuery.data ?? [],

    isLoading:

      productsQuery.isLoading ||

      categoriesQuery.isLoading ||

      inventoryQuery.isLoading ||

      ordersQuery.isLoading ||

      postsQuery.isLoading ||

      postCategoriesQuery.isLoading,

  };



  const value = useMemo<AdminContextValue>(

    () => ({

      ...state,

      upsertProduct: (p) => {

        void productMut.mutateAsync(p);

      },

      deleteProduct: (id) => {

        void deleteProductMut.mutateAsync(id);

      },

      setProductImages: (id, images) => {

        void setProductImagesMut.mutateAsync({ id, images });

      },

      upsertCategory: (c) => {

        void categoryMut.mutateAsync(c);

      },

      deleteCategory: (id) => {

        void deleteCategoryMut.mutateAsync(id);

      },

      setStock: (productId, stock) => {

        void setStockMut.mutateAsync({ productId, stock });

      },

      setThreshold: (productId, threshold) => {

        void setThresholdMut.mutateAsync({ productId, threshold });

      },

      adjustStock: (productId, delta) => {

        const cur = state.inventory[productId]?.stock ?? 0;

        void setStockMut.mutateAsync({ productId, stock: Math.max(0, cur + delta) });

      },

      addOrder: (o) => {

        const order: Order = {

          ...o,

          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,

          createdAt: new Date().toISOString(),

          status: o.status ?? "pending",

        };

        console.warn("[admin] addOrder is deprecated — orders are created via checkout API");

        return order;

      },

      setOrderStatus: (id, status) => {

        void orderStatusMut.mutateAsync({ id, status });

      },

      deleteOrder: (id) => {

        void deleteOrderMut.mutateAsync(id);

      },

      addMedia: (m) => {

        const item: MediaItem = {

          id: `med-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,

          createdAt: new Date().toISOString(),

          productIds: m.productIds ?? [],

          name: m.name,

          url: m.url,

          width: m.width,

          height: m.height,

        };

        void mediaMut.mutateAsync(item);

        if (item.productIds.length) {

          for (const pid of item.productIds) {

            const product = state.products.find((p) => p.id === pid);

            if (product && !product.images.includes(item.url)) {

              void setProductImagesMut.mutateAsync({

                id: pid,

                images: [...product.images, item.url],

              });

            }

          }

        }

        return item;

      },

      deleteMedia: (id) => {

        const item = state.media.find((m) => m.id === id);

        void deleteMediaMut.mutateAsync(id);

        if (item) {

          for (const p of state.products) {

            if (p.images.includes(item.url)) {

              void setProductImagesMut.mutateAsync({

                id: p.id,

                images: p.images.filter((u) => u !== item.url),

              });

            }

          }

        }

      },

      renameMedia: (id, name) => {

        const item = state.media.find((m) => m.id === id);

        if (!item) return;

        const updated = { ...item, name };

        void mediaMut.mutateAsync(updated);

      },

      setMediaProducts: (id, productIds) => {

        const item = state.media.find((m) => m.id === id);

        if (!item) return;

        const updated = { ...item, productIds };

        void mediaMut.mutateAsync(updated);

        for (const p of state.products) {

          const has = p.images.includes(item.url);

          const should = productIds.includes(p.id);

          if (should && !has) {

            void setProductImagesMut.mutateAsync({ id: p.id, images: [...p.images, item.url] });

          } else if (!should && has) {

            void setProductImagesMut.mutateAsync({

              id: p.id,

              images: p.images.filter((u) => u !== item.url),

            });

          }

        }

      },

      upsertPost: (p) => {

        void postMut.mutateAsync(p);

      },

      deletePost: (id) => {

        void deletePostMut.mutateAsync(id);

      },

      upsertPostCategory: (c) => {

        void postCategoryMut.mutateAsync(c);

      },

      deletePostCategory: (id) => {

        void deletePostCategoryMut.mutateAsync(id);

      },

    }),

    [

      state,

      productMut,

      deleteProductMut,

      setProductImagesMut,

      categoryMut,

      deleteCategoryMut,

      setStockMut,

      setThresholdMut,

      orderStatusMut,

      deleteOrderMut,

      postMut,

      deletePostMut,

      postCategoryMut,

      deletePostCategoryMut,

      mediaMut,

      deleteMediaMut,

    ],

  );



  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;

}



export function useAdminStore() {

  const ctx = useContext(AdminContext);

  if (!ctx) throw new Error("useAdminStore must be used inside AdminStoreProvider");

  return ctx;

}


