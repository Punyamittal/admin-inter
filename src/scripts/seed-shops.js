import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

const DATA = [
  {
    "restaurant_name": "Georgia",
    "categories": [
      {
        "name": "Sandwiches",
        "items": [
          { "name": "Veg Cheese Sandwich", "price": 50 },
          { "name": "Egg Cheese Sandwich", "price": 75 },
          { "name": "Chicken Cheese Sandwich", "price": 75 },
          { "name": "Paneer Cheese Sandwich", "price": 75 },
          { "name": "Corn Cheese Sandwich", "price": 75 },
          { "name": "Chilli Cheese Toast", "price": 75 },
          { "name": "Club Sandwich", "price": 70 }
        ]
      },
      {
        "name": "Egg Items",
        "items": [
          { "name": "Bread Omelette", "price": 75 },
          { "name": "Omelette (2 Egg)", "price": 40 },
          { "name": "Boiled Egg (2 Egg)", "price": 30 }
        ]
      },
      {
        "name": "Fast Food",
        "items": [
          { "name": "Veg Burger", "price": 70 },
          { "name": "Veg Roll", "price": 70 }
        ]
      },
      {
        "name": "Maggi",
        "items": [
          { "name": "Veg Maggi", "price": 30 },
          { "name": "Veg Cheese Maggi", "price": 45 }
        ]
      },
      {
        "name": "Snacks",
        "items": [
          { "name": "Veg Samosa (1 pc)", "price": 20 }
        ]
      }
    ]
  },
  {
    "restaurant_name": "Sri's",
    "categories": [
      {
        "name": "Snacks",
        "items": [
          { "name": "Samosa", "price": 20 },
          { "name": "Kachori", "price": 25 },
          { "name": "Veg Patty", "price": 30 },
          { "name": "Paneer Patty", "price": 40 }
        ]
      },
      {
        "name": "Chaat Items",
        "items": [
          { "name": "Samosa Chaat", "price": 60 },
          { "name": "Pani Puri", "price": 40 },
          { "name": "Bhel Puri", "price": 50 },
          { "name": "Pav Bhaji", "price": 80 }
        ]
      },
      {
        "name": "Fries",
        "items": [
          { "name": "Spicy Fries", "price": 60 },
          { "name": "Creamy Fries", "price": 80 },
          { "name": "Cheese Fries", "price": 90 }
        ]
      }
    ]
  },
  {
    "restaurant_name": "Hot & Cool",
    "categories": [
      {
        "name": "Beverages",
        "items": [
          { "name": "Tea/Coffee", "price": 15 },
          { "name": "Boost/Horlicks", "price": 30 },
          { "name": "Badam Milk", "price": 30 }
        ]
      },
      {
        "name": "Juices",
        "items": [
          { "name": "Watermelon Juice", "price": 50 },
          { "name": "Orange Juice", "price": 50 },
          { "name": "Mango Juice", "price": 80 }
        ]
      }
    ]
  },
  {
    "restaurant_name": "Alpha",
    "categories": [
      {
        "name": "Shawarma",
        "items": [
          { "name": "Veg Shawarma", "price": 70 },
          { "name": "Chicken Shawarma", "price": 100 },
          { "name": "Jumbo Shawarma", "price": 150 }
        ]
      }
    ]
  }
];

async function seed() {
  console.log('--- GLOBAL RE-SEEDING START ---');

  const locName = "North Square";
  let { data: loc } = await supabase.from('locations').select('id').eq('name', locName).maybeSingle();
  if (!loc) {
    const { data: nLoc } = await supabase.from('locations').insert({ name: locName }).select().single();
    loc = nLoc;
  }
  console.log('Location ID:', loc.id);

  for (const shopData of DATA) {
    console.log(`\nShop: ${shopData.restaurant_name}`);
    
    // Get/Create Shop (ignoring rating for now as we saw it missing)
    let { data: shop } = await supabase.from('shops').select('id').eq('name', shopData.restaurant_name).maybeSingle();
    if (!shop) {
      const { data: nShop } = await supabase.from('shops').insert({
        location_id: loc.id,
        name: shopData.restaurant_name
      }).select().single();
      shop = nShop;
    }
    console.log(`  ID: ${shop.id}`);

    for (const catData of shopData.categories) {
      // Get/Create Global Category
      let { data: cat } = await supabase.from('categories').select('id').eq('name', catData.name).maybeSingle();
      if (!cat) {
        const { data: nCat } = await supabase.from('categories').insert({
          name: catData.name
        }).select().single();
        cat = nCat;
      }
      console.log(`    Cat: ${catData.name} (${cat.id})`);

      const items = catData.items.map(i => ({
        shop_id: shop.id,
        category_id: cat.id,
        name: i.name,
        price: i.price
      }));

      const { error: iErr } = await supabase.from('menu_items').insert(items);
      if (iErr) console.warn(`      Items might exist: ${iErr.message}`);
      else console.log(`      Added ${items.length} items`);
    }
  }

  console.log('\n--- SEEDING COMPLETE ---');
}

seed();
