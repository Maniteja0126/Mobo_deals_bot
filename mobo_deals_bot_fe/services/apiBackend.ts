import { User , Product , Order , OrderStatus, AIResponseSchema} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE;


async function request<T>(path:string, options? : RequestInit) : Promise<T> {
    const res = await fetch(`${API_BASE}${path}` , {
        headers : {'Content-Type' : 'application/json' , ...(options?.headers || {})},
        ...options
    });
    if(!res.ok) {
        const body = await res.text();
        throw new Error(body || res.statusText);
    }

    return res.json() as Promise<T>;
}


export const authAPI = {
   login : async (email : string , password : string) : Promise<User> => {
       const user = await request<User>('/auth/login' , {
           method : 'POST',
           body : JSON.stringify({email , password})
       });
       return user;
   },
   register: async (name : string , email : string , mobile : string , password : string) : Promise<User> => {
       const user = await request<User>('/auth/register' , {
           method : 'POST',
           body : JSON.stringify({name , email , mobile , password}),
       });
       return user;
   }
};


export const productsAPI = {
    getAll: async (): Promise<Product[]> => {
      const data = await request<{ products: Product[] }>('/products');
      return data.products;
    },
    getById: async (id: string): Promise<Product | undefined> => {
      const data = await request<{ product?: Product }>(`/products/${id}`);
      return data.product;
    },
    getByIds: async (ids: string[]): Promise<Product[]> => {
      const data = await request<{ products: Product[] }>('/products/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      return data.products;
    },
};  

export const ordersAPI = {
    create: async (userId: string, items: { productId: string; quantity: number }[]): Promise<Order> => {
      const data = await request<{ order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify({ userId, items }),
      });
      return data.order;
    },
    getUserOrders: async (userId: string): Promise<Order[]> => {
      const data = await request<Order[]>(`/orders/${encodeURIComponent(userId)}`);
      return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
};

export async function sendChat(payload: { userId?: string; message: string; userName?: string; }): Promise<AIResponseSchema> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.text()) || res.statusText);
    return res.json();
}

