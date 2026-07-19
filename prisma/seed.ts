import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Users ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@1234", 12);
  const demoHash = await bcrypt.hash("Demo@1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nutrition.app" },
    update: {},
    create: {
      email: "admin@nutrition.app",
      name: "Platform Admin",
      passwordHash: adminHash,
      role: Role.ADMIN,
      provider: "credentials",
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@nutrition.app" },
    update: {},
    create: {
      email: "demo@nutrition.app",
      name: "Demo User",
      passwordHash: demoHash,
      role: Role.USER,
      provider: "credentials",
    },
  });

  // Demo user health profile
  await prisma.healthProfile.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      dateOfBirth: new Date("1995-03-15"),
      gender: "female",
      heightCm: 165,
      weightKg: 62,
      activityLevel: "moderate",
      dietType: "vegetarian",
      goal: "lose",
      targetWeightKg: 58,
      preferredCuisine: "indian",
      allergies: "",
      bmr: 1380,
      dailyCalorieTarget: 1650,
      proteinTarget: 124,
      carbTarget: 165,
      fatTarget: 55,
    },
  });

  console.log(`  ✓ Admin: ${admin.email}`);
  console.log(`  ✓ Demo: ${demo.email}`);

  // ── Food Database ───────────────────────────────────────────────────────
  const foods = [
    // Indian staples
    { name: "Roti (phulka)", caloriesPerServing: 80, protein: 2.7, carbs: 18, fat: 0.5, fiber: 2.7, servingSize: 1, servingUnit: "piece", cuisine: "indian", dietTags: "vegetarian,vegan" },
    { name: "Cooked White Rice", caloriesPerServing: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, sodium: 1, servingSize: 100, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,vegan,jain" },
    { name: "Cooked Brown Rice", caloriesPerServing: 112, protein: 2.6, carbs: 23.5, fat: 0.9, fiber: 1.8, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Dal (lentil curry)", caloriesPerServing: 180, protein: 9, carbs: 27, fat: 3, fiber: 6, servingSize: 150, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,vegan,high-protein" },
    { name: "Chana Masala", caloriesPerServing: 270, protein: 13, carbs: 35, fat: 8, fiber: 9, servingSize: 200, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,vegan,high-protein" },
    { name: "Paneer Tikka", caloriesPerServing: 265, protein: 18, carbs: 7, fat: 18, fiber: 2, servingSize: 150, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,high-protein" },
    { name: "Aloo Gobi", caloriesPerServing: 196, protein: 4, carbs: 26, fat: 8, fiber: 4, servingSize: 200, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,vegan" },
    { name: "Vegetable Biryani", caloriesPerServing: 290, protein: 6, carbs: 45, fat: 8, fiber: 3, servingSize: 200, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian" },
    { name: "Masoor Dal", caloriesPerServing: 160, protein: 9, carbs: 27, fat: 1, fiber: 7, servingSize: 150, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,vegan,high-protein" },
    { name: "Idli", caloriesPerServing: 58, protein: 1.6, carbs: 12, fat: 0.1, fiber: 1, servingSize: 1, servingUnit: "piece", cuisine: "indian", dietTags: "vegetarian,vegan" },
    { name: "Dosa (plain)", caloriesPerServing: 168, protein: 4, carbs: 29, fat: 4, fiber: 1, servingSize: 1, servingUnit: "piece", cuisine: "indian", dietTags: "vegetarian" },
    { name: "Sambar", caloriesPerServing: 105, protein: 5, carbs: 18, fat: 1.5, fiber: 5, servingSize: 150, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,vegan" },
    { name: "Chicken Tikka", caloriesPerServing: 260, protein: 31, carbs: 3, fat: 14, fiber: 0.5, servingSize: 150, servingUnit: "g", cuisine: "indian", dietTags: "high-protein" },
    { name: "Chicken Curry", caloriesPerServing: 243, protein: 22, carbs: 6, fat: 15, fiber: 1, servingSize: 200, servingUnit: "g", cuisine: "indian", dietTags: "high-protein" },
    { name: "Fish Curry", caloriesPerServing: 210, protein: 24, carbs: 5, fat: 10, fiber: 1, servingSize: 200, servingUnit: "g", cuisine: "indian", dietTags: "high-protein" },
    { name: "Curd (plain yogurt)", caloriesPerServing: 98, protein: 9, carbs: 7.5, fat: 4.3, servingSize: 150, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,high-protein" },
    { name: "Paneer Butter Masala", caloriesPerServing: 320, protein: 11, carbs: 15, fat: 24, fiber: 2, servingSize: 200, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian" },
    { name: "Poha", caloriesPerServing: 250, protein: 5, carbs: 45, fat: 6, fiber: 3, servingSize: 200, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,vegan" },
    { name: "Upma", caloriesPerServing: 240, protein: 5, carbs: 38, fat: 7, fiber: 2, servingSize: 200, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian" },
    { name: "Khichdi", caloriesPerServing: 200, protein: 6, carbs: 35, fat: 4, fiber: 3, servingSize: 200, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian" },
    { name: "Gulab Jamun (1 piece)", caloriesPerServing: 150, protein: 2, carbs: 25, fat: 5, sugar: 18, servingSize: 1, servingUnit: "piece", cuisine: "indian", dietTags: "vegetarian" },

    // Fruits
    { name: "Banana", caloriesPerServing: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14, servingSize: 1, servingUnit: "medium", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Apple", caloriesPerServing: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19, servingSize: 1, servingUnit: "medium", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Orange", caloriesPerServing: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1, sugar: 12, servingSize: 1, servingUnit: "medium", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Mango", caloriesPerServing: 99, protein: 1.4, carbs: 25, fat: 0.6, fiber: 3, sugar: 23, servingSize: 100, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,vegan,jain" },
    { name: "Grapes", caloriesPerServing: 104, protein: 1.1, carbs: 27, fat: 0.2, fiber: 1.4, sugar: 23, servingSize: 150, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Strawberries", caloriesPerServing: 49, protein: 1, carbs: 11.7, fat: 0.5, fiber: 3, sugar: 7.4, servingSize: 150, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Watermelon", caloriesPerServing: 46, protein: 0.9, carbs: 11.5, fat: 0.2, fiber: 0.6, sugar: 9.4, servingSize: 150, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Papaya", caloriesPerServing: 59, protein: 0.5, carbs: 15, fat: 0.1, fiber: 2, sugar: 11, servingSize: 150, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain" },

    // Vegetables
    { name: "Boiled Egg", caloriesPerServing: 78, protein: 6.3, carbs: 0.6, fat: 5.3, servingSize: 1, servingUnit: "large", cuisine: "international", dietTags: "vegetarian,high-protein,keto" },
    { name: "Boiled Broccoli", caloriesPerServing: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5.1, servingSize: 156, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain,keto,low-carb" },
    { name: "Boiled Potato", caloriesPerServing: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Avocado", caloriesPerServing: 234, protein: 2.9, carbs: 12, fat: 21, fiber: 9.8, servingSize: 150, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,keto" },
    { name: "Carrot (raw)", caloriesPerServing: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Cucumber", caloriesPerServing: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 1, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain,keto,low-carb" },
    { name: "Spinach (cooked)", caloriesPerServing: 23, protein: 3, carbs: 3.8, fat: 0.3, fiber: 2.4, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain,keto,low-carb" },
    { name: "Sweet Potato (baked)", caloriesPerServing: 90, protein: 2, carbs: 21, fat: 0.1, fiber: 3.3, sugar: 6.6, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain" },

    // Proteins
    { name: "Chicken Breast (grilled)", caloriesPerServing: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "high-protein,keto,low-carb" },
    { name: "Grilled Salmon", caloriesPerServing: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "high-protein,keto,low-carb" },
    { name: "Tofu", caloriesPerServing: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,high-protein,low-carb" },
    { name: "Tuna (canned)", caloriesPerServing: 116, protein: 26, carbs: 0, fat: 1, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "high-protein,keto,low-carb" },
    { name: "Greek Yogurt (plain)", caloriesPerServing: 59, protein: 10, carbs: 3.6, fat: 0.4, sugar: 3.2, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,high-protein" },
    { name: "Almonds", caloriesPerServing: 164, protein: 6, carbs: 6.1, fat: 14, fiber: 3.5, servingSize: 28, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,keto,low-carb,jain" },
    { name: "Walnuts", caloriesPerServing: 185, protein: 4.3, carbs: 3.9, fat: 18, fiber: 1.9, servingSize: 28, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,keto,low-carb,jain" },
    { name: "Peanut Butter", caloriesPerServing: 188, protein: 8, carbs: 7, fat: 16, fiber: 2, servingSize: 32, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,high-protein,keto,low-carb" },

    // Grains & legumes
    { name: "Oats (rolled, dry)", caloriesPerServing: 150, protein: 5.4, carbs: 27, fat: 2.5, fiber: 4, servingSize: 40, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Quinoa (cooked)", caloriesPerServing: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,jain,high-protein" },
    { name: "Chickpeas (cooked)", caloriesPerServing: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,high-protein" },
    { name: "Black Beans (cooked)", caloriesPerServing: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan,high-protein" },
    { name: "Whole Wheat Bread (1 slice)", caloriesPerServing: 80, protein: 4, carbs: 14, fat: 1.1, fiber: 2, servingSize: 1, servingUnit: "slice", cuisine: "international", dietTags: "vegetarian,vegan" },

    // Dairy
    { name: "Milk (whole)", caloriesPerServing: 149, protein: 7.7, carbs: 11.7, fat: 8, sugar: 12, servingSize: 244, servingUnit: "ml", cuisine: "international", dietTags: "vegetarian" },
    { name: "Cheddar Cheese", caloriesPerServing: 113, protein: 7, carbs: 0.4, fat: 9.3, servingSize: 28, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,keto,low-carb" },
    { name: "Paneer", caloriesPerServing: 296, protein: 25, carbs: 3.6, fat: 21, fiber: 0, servingSize: 100, servingUnit: "g", cuisine: "indian", dietTags: "vegetarian,high-protein,keto,low-carb" },
    { name: "Cottage Cheese (low-fat)", caloriesPerServing: 72, protein: 11, carbs: 3.4, fat: 1.2, servingSize: 100, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,high-protein,low-carb" },

    // Snacks & fast food
    { name: "Dark Chocolate (70%)", caloriesPerServing: 170, protein: 2.2, carbs: 13, fat: 12, fiber: 3, sugar: 7, servingSize: 28, servingUnit: "g", cuisine: "international", dietTags: "vegetarian" },
    { name: "Potato Chips", caloriesPerServing: 152, protein: 2, carbs: 15, fat: 10, fiber: 1.4, sodium: 149, servingSize: 28, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan" },
    { name: "Pizza Slice (cheese)", caloriesPerServing: 285, protein: 12, carbs: 36, fat: 10, fiber: 2.5, sodium: 640, servingSize: 1, servingUnit: "slice", cuisine: "international", dietTags: "vegetarian" },
    { name: "Burger (beef)", caloriesPerServing: 354, protein: 20, carbs: 29, fat: 17, fiber: 1.5, sodium: 396, servingSize: 1, servingUnit: "burger", cuisine: "american", dietTags: "" },
    { name: "French Fries", caloriesPerServing: 365, protein: 4, carbs: 48, fat: 17, fiber: 4, sodium: 246, servingSize: 117, servingUnit: "g", cuisine: "international", dietTags: "vegetarian,vegan" },
    { name: "Samosa (1 piece)", caloriesPerServing: 262, protein: 5, carbs: 28, fat: 15, fiber: 2, servingSize: 1, servingUnit: "piece", cuisine: "indian", dietTags: "vegetarian" },

    // Beverages
    { name: "Coffee (black)", caloriesPerServing: 2, protein: 0.3, carbs: 0, fat: 0, servingSize: 240, servingUnit: "ml", cuisine: "international", dietTags: "vegetarian,vegan" },
    { name: "Green Tea", caloriesPerServing: 2, protein: 0.5, carbs: 0, fat: 0, servingSize: 240, servingUnit: "ml", cuisine: "international", dietTags: "vegetarian,vegan" },
    { name: "Masala Chai", caloriesPerServing: 90, protein: 3, carbs: 12, fat: 4, sugar: 10, servingSize: 240, servingUnit: "ml", cuisine: "indian", dietTags: "vegetarian" },
    { name: "Orange Juice", caloriesPerServing: 112, protein: 1.7, carbs: 26, fat: 0.5, sugar: 21, servingSize: 248, servingUnit: "ml", cuisine: "international", dietTags: "vegetarian,vegan,jain" },
    { name: "Coconut Water", caloriesPerServing: 46, protein: 1.7, carbs: 8.9, fat: 0.5, sugar: 6.3, servingSize: 240, servingUnit: "ml", cuisine: "international", dietTags: "vegetarian,vegan,jain,low-carb" },
    { name: "Lassi (sweet)", caloriesPerServing: 180, protein: 5, carbs: 28, fat: 5, sugar: 24, servingSize: 240, servingUnit: "ml", cuisine: "indian", dietTags: "vegetarian" },
  ];

  for (const f of foods) {
    const existing = await prisma.foodItem.findFirst({ where: { name: f.name } });
    if (!existing) {
      await prisma.foodItem.create({
        data: {
          name: f.name,
          caloriesPerServing: f.caloriesPerServing,
          proteinPerServing: f.protein,
          carbsPerServing: f.carbs,
          fatPerServing: f.fat,
          fiberPerServing: f.fiber ?? null,
          sugarPerServing: f.sugar ?? null,
          sodiumPerServing: f.sodium ?? null,
          servingSize: f.servingSize,
          servingUnit: f.servingUnit,
          cuisine: f.cuisine ?? null,
          dietTags: f.dietTags ?? null,
        },
      });
    }
  }
  console.log(`  ✓ ${foods.length} food items`);

  // ── Wellness Articles ──────────────────────────────────────────────────
  const articles = [
    {
      category: "nutrition",
      title: "Understanding Macronutrients: Proteins, Carbs & Fats",
      summary: "A beginner-friendly guide to the three macronutrients your body needs every day.",
      content: " Macronutrients are the nutrients your body needs in large amounts to function optimally. There are three main types:\n\n**Proteins** are the building blocks of your body. They repair tissues, build muscle, and support immune function. Good sources include lean meats, fish, eggs, dairy, legumes, tofu, and nuts. Adults typically need 0.8-1.2g of protein per kg of body weight.\n\n**Carbohydrates** are your body's primary energy source, especially for your brain and muscles during exercise. Choose complex carbs like whole grains, vegetables, and fruits over refined sugars. Aim for 45-65% of your daily calories from carbs.\n\n**Fats** are essential for hormone production, nutrient absorption, and cell health. Focus on healthy fats from avocados, nuts, seeds, olive oil, and fatty fish. Limit saturated fats and avoid trans fats. About 20-35% of your daily calories should come from fat.\n\nA balanced diet includes all three macronutrients in proportions that match your activity level and health goals.\n\n⚠️ *This article is for educational purposes only. Consult a registered dietitian for personalized nutrition advice.*",
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
      author: "NutriAI Wellness Team",
      readTime: 5,
    },
    {
      category: "hydration",
      title: "How Much Water Should You Really Drink?",
      summary: "Debunking the 8-glasses myth with evidence-based hydration guidance.",
      content: " The '8 glasses a day' rule is a good starting point, but your actual water needs depend on several factors:\n\n**Factors that increase water needs:**\n- Physical activity and exercise\n- Hot or humid weather\n- High altitude\n- Fever or illness\n- Pregnancy and breastfeeding\n\n**General guidelines:**\n- Men: ~3.7 liters (125 oz) total water daily\n- Women: ~2.7 liters (91 oz) total water daily\n- This includes water from all beverages and foods (about 20% comes from food)\n\n**Signs you're well-hydrated:**\n- Pale yellow or clear urine\n- Rarely feeling thirsty\n- Good energy levels\n\n**Tips for staying hydrated:**\n1. Keep a reusable water bottle nearby\n2. Drink a glass of water with each meal\n3. Flavor water with lemon, cucumber, or mint\n4. Eat water-rich foods (watermelon, cucumber, soups)\n5. Set reminders on your phone\n\nRemember that over-hydration is also possible — listen to your body and drink when thirsty.\n\n⚠️ *This is general wellness information, not medical advice. Consult a healthcare provider about specific fluid requirements, especially if you have kidney or heart conditions.*",
      imageUrl: "https://images.unsplash.com/photo-1606247050131-75338320837a?w=800",
      author: "NutriAI Wellness Team",
      readTime: 4,
    },
    {
      category: "sleep",
      title: "Sleep Hygiene: Building Better Rest Habits",
      summary: "Practical strategies to improve your sleep quality naturally.",
      content: " Quality sleep is foundational to health — affecting everything from weight management to immune function and mental clarity.\n\n**Why sleep matters:**\n- Poor sleep disrupts hunger hormones (ghrelin up, leptin down), increasing cravings\n- Deep sleep supports muscle recovery and tissue repair\n- Adequate rest strengthens immune function\n- Sleep deficiency is linked to higher risk of chronic conditions\n\n**Evidence-based sleep tips:**\n\n1. **Keep a consistent schedule** — Go to bed and wake up at the same time daily, even on weekends. This regulates your circadian rhythm.\n\n2. **Create a wind-down routine** — Dim lights, avoid screens 30-60 minutes before bed, try gentle stretching or reading.\n\n3. **Optimize your environment** — Keep the room cool (65-68°F/18-20°C), dark, and quiet. Use blackout curtains or a sleep mask.\n\n4. **Limit caffeine after noon** — Caffeine has a half-life of 5-6 hours, so afternoon coffee can affect nighttime sleep.\n\n5. **Exercise regularly** — But avoid vigorous exercise within 3 hours of bedtime.\n\n6. **Avoid heavy meals late** — Eating large meals close to bedtime can disrupt sleep.\n\n7. **Limit alcohol** — While it may help you fall asleep faster, it reduces sleep quality.\n\n8. **Get morning sunlight** — Natural light in the morning helps set your internal clock.\n\nMost adults need 7-9 hours of sleep per night.\n\n⚠️ *If you experience chronic sleep problems, consult a healthcare professional — it may indicate an underlying condition.*",
      imageUrl: "https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=800",
      author: "NutriAI Wellness Team",
      readTime: 6,
    },
    {
      category: "stress",
      title: "Stress Management Through Nutrition & Lifestyle",
      summary: "Foods and habits that help your body handle stress better.",
      content: " Stress is a normal part of life, but chronic stress can take a toll on your physical and mental health. Here's how nutrition and lifestyle choices can help.\n\n**Nutrients that support stress resilience:**\n\n- **Magnesium** (spinach, pumpkin seeds, dark chocolate) — helps regulate cortisol\n- **Omega-3 fatty acids** (salmon, walnuts, flaxseeds) — reduce inflammation and support brain health\n- **Complex carbs** (oats, sweet potatoes) — promote serotonin production\n- **Vitamin C** (citrus, bell peppers) — helps the body recover from stress\n- **Probiotics** (yogurt, fermented foods) — support the gut-brain axis\n\n**Lifestyle practices:**\n\n1. **Regular exercise** — Even a 20-minute walk can reduce stress hormones\n2. **Mindfulness meditation** — 5-10 minutes daily can lower cortisol\n3. **Deep breathing** — Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s\n4. **Limit caffeine and alcohol** — Both can worsen anxiety\n5. **Stay connected** — Social support buffers stress\n6. **Prioritize sleep** — See our sleep hygiene article\n7. **Spend time in nature** — Even short outdoor breaks help\n\n**Foods to limit when stressed:**\n- Excess caffeine (>400mg/day)\n- Refined sugars (cause energy crashes)\n- Highly processed foods\n\nBuilding stress resilience is a gradual process. Start with one or two changes and build from there.\n\n⚠️ *If stress feels overwhelming or you experience symptoms of anxiety or depression, please reach out to a mental health professional.*",
      imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
      author: "NutriAI Wellness Team",
      readTime: 5,
    },
    {
      category: "ayurveda",
      title: "Introduction to Ayurvedic Dietary Principles",
      summary: "An educational overview of how Ayurveda views food, digestion, and balance.",
      content: " **Disclaimer:** This article provides general educational information about traditional wellness concepts. It is not medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns.\n\nAyurveda, which translates to 'science of life,' is a traditional system of wellness that originated in India over 5,000 years ago. Its dietary principles focus on balance and individualization.\n\n**Core concepts:**\n\n**Doshas** — Ayurveda describes three mind-body types (doshas):\n- **Vata** (air & space) — lean, energetic, creative; benefits from warm, grounding foods\n- **Pitta** (fire & water) — medium build, focused, intense; benefits from cooling, fresh foods\n- **Kapha** (earth & water) — solid build, calm, steady; benefits from light, spicy foods\n\n**Six tastes (Rasas):** Ayurveda recommends including all six tastes in each meal for satisfaction and balance:\n1. Sweet (grains, dairy)\n2. Sour (citrus, yogurt)\n3. Salty\n4. Pungent (spices, peppers)\n5. Bitter (leafy greens)\n6. Astringent (legumes, tea)\n\n**Digestion (Agni):** Strong digestive fire is considered essential. Practices include:\n- Eating your largest meal at midday when digestion is strongest\n- Sitting down to eat without distractions\n- Not overeating (eat until 75% full)\n- Sipping warm water with meals\n\n**Food combining guidelines** (traditional, not scientifically validated):\n- Eat fruits separately from other foods\n- Don't combine milk with sour or salty foods\n- Honey should not be heated\n\n**General ayurvedic dietary tips:**\n- Favor fresh, seasonal, locally-grown foods\n- Include all six tastes in meals\n- Cook with digestive spices (ginger, cumin, coriander, turmeric)\n- Avoid ice-cold drinks\n- Eat mindfully and chew thoroughly\n\nWhile these traditional practices have been used for centuries, they should complement — not replace — evidence-based medical care. Always discuss significant dietary changes with a healthcare provider.\n\n⚠️ *This is educational information about traditional concepts, not medical advice or treatment. Ayurvedic practices are not a substitute for professional medical care.*",
      imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800",
      author: "NutriAI Wellness Team",
      readRead: 7,
      readTime: 7,
    },
    {
      category: "fitness",
      title: "Beginner's Guide to Building an Exercise Routine",
      summary: "How to start moving more, even if you've never exercised before.",
      content: " Starting an exercise routine can feel overwhelming, but the key is to start small and build consistency. Here's a practical, evidence-based approach.\n\n**The WHO recommends:**\n- 150-300 minutes of moderate aerobic activity per week, OR\n- 75-150 minutes of vigorous activity per week, AND\n- Muscle-strengthening activities 2+ days per week\n\n**For beginners — start here:**\n\n1. **Week 1-2: Build the habit**\n   - 10-15 minute walks daily\n   - Focus on showing up, not intensity\n\n2. **Week 3-4: Add variety**\n   - 20-30 minute walks 5 days/week\n   - Add basic bodyweight exercises: squats, push-ups (modified if needed), planks\n\n3. **Week 5-8: Build strength**\n   - 30-minute sessions, 4-5 days/week\n   - Mix cardio with strength training\n   - Try yoga or stretching for flexibility\n\n**Types of exercise to include:**\n\n- **Cardiovascular** (walking, cycling, swimming) — heart health, calorie burn\n- **Strength training** (weights, bodyweight, resistance bands) — builds muscle, boosts metabolism\n- **Flexibility** (yoga, stretching) — prevents injury, improves mobility\n- **Balance** (tai chi, single-leg stands) — especially important as we age\n\n**Tips for success:**\n\n- Schedule workouts like appointments\n- Find activities you enjoy — you'll stick with them\n- Track your progress (NutriAI's fitness planner can help!)\n- Rest days are essential — muscles grow during recovery\n- Stay hydrated before, during, and after exercise\n- Warm up for 5-10 minutes before each session\n\n**Common mistakes to avoid:**\n- Doing too much too soon (leads to injury and burnout)\n- Skipping warm-ups and cool-downs\n- Comparing yourself to others\n- Ignoring pain (soreness is normal, sharp pain is not)\n\nRemember: consistency beats intensity. A 15-minute walk you actually do is better than a 60-minute workout you skip.\n\n⚠️ *Consult a healthcare professional before starting a new exercise program, especially if you have existing health conditions.*",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      author: "NutriAI Wellness Team",
      readTime: 6,
    },
  ];

  for (const a of articles) {
    await prisma.article.create({ data: a }).catch(() => {
      // ignore duplicates on re-seed
    });
  }
  console.log(`  ✓ ${articles.length} wellness articles`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
