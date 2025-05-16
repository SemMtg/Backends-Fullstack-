<template>
    <q-page class="row items-center justify-center">
        <div class="post q-pa-lg q-mt-lg" style="max-width: 600px; width: 100%;">
            <q-card class="q-pa-md q-mb-lg shadow-3">
                <q-card-section>
                    <div class="text-h5 text-center text-primary">🍺 Beer List</div>
                </q-card-section>
            </q-card>

            <q-card class="shadow-2 q-pa-md q-mb-lg">
                <q-card-section class="q-pa-lg">
                    <div v-if="loading" class="row justify-center q-mt-lg">
                        <q-spinner color="primary" size="3em" />
                    </div>

                    <div v-if="error" class="text-red text-center q-mt-md q-mb-md">
                        <q-icon name="warning" size="md" color="negative" class="q-mr-sm" />
                        {{ error }}
                    </div>

                    <q-list v-if="beers.length" bordered separator class="q-mt-md q-mb-md">
                        <q-item v-for="beer in beers" :key="beer.id" class="q-pa-md">
                            <q-item-section>
                                <q-item-label class="text-bold text-primary text-h6">{{ beer.name }}</q-item-label>
                                <q-item-label caption class="q-mt-xs">
                                    <span class="text-secondary">{{ beer.brewery }}</span> - 
                                    {{ beer.category }} ({{ beer.percentage }}%)
                                </q-item-label>
                            </q-item-section>

                            <!-- Favorite Button -->
                            <q-item-section side>
                                <q-btn
                                :icon="isFavorite(beer.id) ? 'favorite' : 'favorite_border'"
                                :color="isFavorite(beer.id) ? 'red' : 'grey'"
                                @click="toggleFavorite(beer.id)"
                                flat
                                round
                                :loading="favoriteLoading === beer.id"
                                :disable="!isLoggedIn"
                                />
                            </q-item-section>
                        </q-item>
                    </q-list>

                    <div v-else-if="!loading" class="text-grey text-center q-mt-md q-mb-md">
                        <q-icon name="mood_bad" size="lg" class="q-mb-sm" />
                        <p>No beers found</p>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';

// Define Beer type
type Beer = {
    id: number;
    name: string;
    brewery: string;
    category: string;
    percentage: number;
};

// Initialize beers with type
const beers = ref<Beer[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const favoriteLoading = ref<number | null>(null); // Track loading state for individual favorite buttons
const isLoggedIn = computed(() => !!localStorage.getItem('token')); // Check if user is logged in
const likedBeers = ref<Beer[]>([]);

const $q = useQuasar();

// Fetch beers from the backend
const fetchBeers = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch('http://localhost:3000/beers');
        if (!response.ok) {
        throw new Error('Failed to fetch beers');
        }
        beers.value = await response.json();
    } catch (err) {
        error.value = (err as Error).message;
    } finally {
        loading.value = false;
    }
};

const fetchLikedBeers = async () => {
  const userName = localStorage.getItem('username');
  if (!userName) return;

  try {
    const response = await fetch(`http://localhost:3000/likes/${userName}`);

    if (!response.ok) throw new Error('Failed to fetch liked beers');

    likedBeers.value = await response.json();
  } catch (err) {
    console.error('Error fetching liked beers:', err);
  }
};

// Check if a beer is a favorite
const isFavorite = (beerId: number) => {
  return likedBeers.value.some((beer) => beer.id === beerId);
};

// Toggle favorite status for a beer
const toggleFavorite = async (beerId: number) => {
  if (!isLoggedIn.value) {
    error.value = 'You must be logged in to add favorites.';
    return;
  }

  favoriteLoading.value = beerId;

  try {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('username');

    if (isFavorite(beerId)) {
      // Remove from favorites
      await fetch(`http://localhost:3000/likes/like`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ beerId, userName }),
      });
    } else {
      // Add to favorites
        await fetch(`http://localhost:3000/likes/like`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
            },
            body: JSON.stringify({ beerId, userName }),
        });
    }

    // Re-fetch the list of liked beers to update the UI
        await fetchLikedBeers();
    } catch (err) {
        error.value = (err as Error).message;
    } finally {
        favoriteLoading.value = null;
    }
};

// Listen to Server-Sent Events for notifications
const listenForNotifications = () => {
    const eventSource = new EventSource('http://localhost:3000/events');
    
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const { beerId, userName} = data;
        console.log(data);
        const beer = beers.value.find((b) => b.id === beerId);
        const beerName = beer ? beer.name : 'a beer';

        console.log(userName, beerName)
        // Show toast notification
        if (data.type === "like") {
            $q.notify({
                message: `${userName} liked ${beerName}!`,
                color: 'green',
                position: 'top',
                timeout: 5000,
            });
        } else if  (data.type === "new_beer") {
            beers.value.push(data.beer);
        }
    };

    eventSource.onerror = (err) => {
        console.error('Error in EventSource:', err);
        eventSource.close();
    };
};

onMounted(async () => {
    await fetchBeers();
    if (isLoggedIn.value) {
        await fetchLikedBeers();
    }
    listenForNotifications();
});
</script>