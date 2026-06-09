
export type Vertical = "restaurant" | "store";

export interface Image {
  base_url: string;
  filename: string;
}

export interface Address {
  street_number: string;
  street_name: string;
  suburb: string;
  town: string;
  province: string;
  postal_code: string;
  latitude: string;
  longitude: string;
}

export interface RestaurantDetails {
  id: number;
  name: string;
  vertical: Vertical;
  description: string;
  restaurant_group: Record<string, unknown>;
  classifications: { id: string; name: string; type: string; vertical: string; }[];
  departments: unknown[];
  tags: { id: number; name: string; type: string; }[];
  menuId: number; // <- this property might be incorrect
  address: Address;
  images: {
		restaurant_header: Image;
		restaurant_logo: Image;
	};
  supported_ux: string[];
}

export async function fetchRestaurantDetails(
  id: number,
): Promise<RestaurantDetails> {
  const response = await fetch(
    `https://api.mrdfood.com/exposure/preview/v2/restaurants/${id}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch restaurant details (${response.status} ${response.statusText})`,
    );
  }

  return (await response.json()) as RestaurantDetails;
}

export interface Menu {
  id: number
  has_menu_type: string // "restaurant" or "group"
  has_menu_id: number // restaurant/group id
  name: string
  status: string
  sections: Section[]
  addons: Addon[]
  extras: OptionExtra[]
  options: OptionExtra[]
  original_id: number
  menu_type: string
  featured_items: FeaturedItem[]
}

export interface Section {
  id: number
  name: string
  orderindex: number
  items: Item[]
  availability: Availability
}

export interface Item {
  id: number
  name: string
  description: string
  orderindex: number
  variants: Variant[]
  availability: Availability
  media: Image
  featured?: boolean
}

export interface Variant {
  id: number
  name: string
  default: boolean
  price: number
  option_indices?: number[]
  availability: Availability
  extra_indices?: number[]
  addon_indices?: number[]
}

export interface Availability {
  status: string
  description: string
}

export interface Addon {
  id: number
  name: string
  label: string
  minimum_select: number
  maximum_select: number
  items: AddonItem[]
  orderindex: number
  price_modifier?: string
}

export interface AddonItem {
  id: number
  name: string
  description: string
  variant_id: number
  extra_indices?: number[]
  price?: number
  option_indices?: number[]
}

export interface OptionExtra {
  id: number
  name: string
  label: string
  minimum_select: number
  maximum_select: number
  items: OEItem[]
  orderindex: number
}

export interface OEItem {
  id: number
  name: string
  default: boolean
  price: number
  orderindex: number
  availability: Availability
}

export interface FeaturedItem {
  type: string
  items: number[]
  title: string
}


export async function fetchRestaurantMenu(
  menuId: number,
): Promise<Menu> {
  const response = await fetch(
    `https://api.mrdfood.com/exposure/preview/menus/${menuId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch restaurant menu (${response.status} ${response.statusText})`,
    );
  }

  return (await response.json()) as Menu;
}
