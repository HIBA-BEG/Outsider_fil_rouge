import { MongoClient } from 'mongodb';
import * as cities from '../../db_cities/cities_mar.json';

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Observer';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db();
    const citiesCollection = database.collection('cities');

    await citiesCollection.deleteMany({});

    const transformedCities = cities.cities.map((city) => ({
      name: city.city,
      country: city.country,
      admin_name: city.admin_name,
      coordinates: {
        latitude: parseFloat(city.lat),
        longitude: parseFloat(city.lng),
      },
      population: parseInt(city.population),
      isVerified: true,
      createdAt: new Date(),
    }));

    const result = await citiesCollection.insertMany(transformedCities);
    console.log(`Successfully inserted ${result.insertedCount} cities`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch((err) => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
