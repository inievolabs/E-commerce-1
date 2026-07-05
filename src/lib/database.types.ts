export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string;
          country: string;
          created_at: string;
          id: string;
          is_default: boolean;
          label: string;
          line1: string;
          postal_code: string;
          user_id: string;
        };
        Insert: {
          city: string;
          country: string;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          label: string;
          line1: string;
          postal_code: string;
          user_id: string;
        };
        Update: {
          city?: string;
          country?: string;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          line1?: string;
          postal_code?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          subject: string | null;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          subject?: string | null;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          name: string;
          phone: string | null;
          type: string;
          order_count: number;
          total_spent: number;
          last_order_at: string | null;
          first_seen_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          name: string;
          phone?: string | null;
          type?: string;
          order_count?: number;
          total_spent?: number;
          last_order_at?: string | null;
          first_seen_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          name?: string;
          phone?: string | null;
          type?: string;
          order_count?: number;
          total_spent?: number;
          last_order_at?: string | null;
          first_seen_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          description: string | null;
          id: string;
          label: string;
        };
        Insert: {
          description?: string | null;
          id: string;
          label: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          label?: string;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          low_stock_threshold: number;
          product_id: string;
          stock: number;
        };
        Insert: {
          low_stock_threshold?: number;
          product_id: string;
          stock?: number;
        };
        Update: {
          low_stock_threshold?: number;
          product_id?: string;
          stock?: number;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: true;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          created_at: string;
          height: number;
          id: string;
          name: string;
          product_ids: string[];
          url: string;
          width: number;
        };
        Insert: {
          created_at?: string;
          height: number;
          id?: string;
          name: string;
          product_ids?: string[];
          url: string;
          width: number;
        };
        Update: {
          created_at?: string;
          height?: number;
          id?: string;
          name?: string;
          product_ids?: string[];
          url?: string;
          width?: number;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          color: string | null;
          id: string;
          name: string;
          order_id: string;
          price: number;
          product_id: string | null;
          qty: number;
          size: string | null;
        };
        Insert: {
          color?: string | null;
          id?: string;
          name: string;
          order_id: string;
          price: number;
          product_id?: string | null;
          qty: number;
          size?: string | null;
        };
        Update: {
          color?: string | null;
          id?: string;
          name?: string;
          order_id?: string;
          price?: number;
          product_id?: string | null;
          qty?: number;
          size?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          id: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          shipping: number;
          shipping_address: string;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          id: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          shipping?: number;
          shipping_address: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string | null;
          id?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          shipping?: number;
          shipping_address?: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          user_id?: string | null;
        };
        Relationships: [];
      };
      post_categories: {
        Row: {
          description: string | null;
          id: string;
          label: string;
        };
        Insert: {
          description?: string | null;
          id: string;
          label: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          label?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          author: string;
          body: string;
          category_id: string;
          cover: string | null;
          excerpt: string;
          id: string;
          published: boolean;
          published_at: string | null;
          tags: string[];
          title: string;
        };
        Insert: {
          author: string;
          body: string;
          category_id: string;
          cover?: string | null;
          excerpt: string;
          id: string;
          published?: boolean;
          published_at?: string | null;
          tags?: string[];
          title: string;
        };
        Update: {
          author?: string;
          body?: string;
          category_id?: string;
          cover?: string | null;
          excerpt?: string;
          id?: string;
          published?: boolean;
          published_at?: string | null;
          tags?: string[];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "post_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string;
          color: string;
          color_hex: string;
          created_at: string;
          description: string;
          gender: string;
          id: string;
          images: Json;
          is_bestseller: boolean;
          is_new: boolean;
          materials: string;
          name: string;
          price: number;
          returns_info: string;
          shipping_info: string;
          show_size_guide: boolean;
          size_guide: Json;
          size_guide_title: string;
          sizes: string[];
          tax_included: boolean;
          tax_label: string;
          trust_badges: Json;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          color: string;
          color_hex: string;
          created_at?: string;
          description: string;
          gender: string;
          id: string;
          images?: Json;
          is_bestseller?: boolean;
          is_new?: boolean;
          materials: string;
          name: string;
          price: number;
          returns_info?: string;
          shipping_info?: string;
          show_size_guide?: boolean;
          size_guide?: Json;
          size_guide_title?: string;
          sizes?: string[];
          tax_included?: boolean;
          tax_label?: string;
          trust_badges?: Json;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          color?: string;
          color_hex?: string;
          created_at?: string;
          description?: string;
          gender?: string;
          id?: string;
          images?: Json;
          is_bestseller?: boolean;
          is_new?: boolean;
          materials?: string;
          name?: string;
          price?: number;
          returns_info?: string;
          shipping_info?: string;
          show_size_guide?: boolean;
          size_guide?: Json;
          size_guide_title?: string;
          sizes?: string[];
          tax_included?: boolean;
          tax_label?: string;
          trust_badges?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          source?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_carts: {
        Row: {
          id: string;
          user_id: string;
          items: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          items?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          items?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_order_id: { Args: never; Returns: string };
      is_admin: { Args: never; Returns: boolean };
      place_cod_order: {
        Args: {
          p_user_id: string | null;
          p_customer_name: string;
          p_customer_email: string;
          p_customer_phone: string;
          p_shipping_address: string;
          p_subtotal: number;
          p_shipping: number;
          p_total: number;
          p_items: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
      payment_method: "cod";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
