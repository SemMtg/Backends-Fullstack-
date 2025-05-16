<template>
    <q-page class="row items-center justify-center">
		<div class="profile q-pa-lg q-mt-lg" style="max-width: 600px; width: 100%;">
			<q-card class="q-pa-md q-mb-lg shadow-3">
				<q-card-section>
					<div class="text-h5 text-center text-primary">👤 Profile</div>
				</q-card-section>
			</q-card>
	
			<!-- Login Form -->
			<q-card class="shadow-2 q-pa-md q-mb-lg" v-if="!isLoggedIn">
				<q-card-section>
					<div class="text-h6 text-center q-mb-md">Login</div>
		
					<q-input v-model="username" label="Username" outlined class="q-mb-md" />
					<q-input v-model="password" type="password" label="Password" outlined class="q-mb-md" />
		
					<q-btn color="primary" label="Login" @click="login" class="full-width q-mb-md" :loading="loading" />
		
					<div v-if="error" class="text-red text-center q-mt-sm">
						<q-icon name="warning" size="md" color="negative" class="q-mr-sm" />
						{{ error }}
					</div>
				</q-card-section>
			</q-card>
	
			<!-- Favorites List -->
			<q-card class="shadow-2 q-pa-md q-mb-lg" v-else>
				<q-card-section>
					<div class="text-h6 text-center q-mb-md">🍺 Favorite Beers</div>
		
					<div v-if="loading" class="row justify-center q-mt-lg">
						<q-spinner color="primary" size="3em" />
					</div>
		
					<q-list v-if="favorites.length" bordered separator class="q-mt-md q-mb-md">
						<q-item v-for="beer in favorites" :key="beer.id" class="q-pa-md">
							<q-item-section>
								<q-item-label class="text-bold text-primary text-h6">{{ beer.name }}</q-item-label>
								<q-item-label caption class="q-mt-xs">
									<span class="text-secondary">{{ beer.brewery }}</span> - 
									{{ beer.category }} ({{ beer.percentage }}%)
								</q-item-label>
							</q-item-section>
						</q-item>
					</q-list>
		
					<div v-else class="text-grey text-center q-mt-md q-mb-md">
						<q-icon name="mood_bad" size="lg" class="q-mb-sm" />
						<p>No favorite beers found</p>
					</div>
		
					<q-btn color="negative" label="Logout" @click="logout" class="full-width q-mt-md" />
				</q-card-section>
			</q-card>
		</div>
    </q-page>
</template>
  
<script setup lang="ts">
import { ref, onMounted } from 'vue';
  
// User state
const isLoggedIn = ref(!!localStorage.getItem('token'));
const username = ref(localStorage.getItem('username') || '');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);
const favorites = ref<Array<{ id: number; name: string; brewery: string; category: string; percentage: number }>>([]);
  
const login = async () => {
	loading.value = true;
	error.value = null;
  
    try {
		const response = await fetch('http://localhost:3000/users/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userName: username.value, password: password.value }),
		});
  
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Login failed');
		}
  
		const data = await response.json();
		localStorage.setItem('token', data.token);
		localStorage.setItem('username', username.value);
		isLoggedIn.value = true;
	
		await fetchFavorites();
    } catch (err) {
      	error.value = (err as Error).message;
    } finally {
      	loading.value = false;
    }
};
  
const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (!token || !storedUsername) return;
  
    loading.value = true;
  
    try {
		const response = await fetch(`http://localhost:3000/likes/${storedUsername}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
  
      	if (!response.ok) throw new Error('Failed to fetch liked beers');
  
      	favorites.value = await response.json();
      	console.log('Fetched favorites:', favorites.value);
    } catch (err) {
      	console.error('Error fetching favorites:', err);
      	error.value = 'Failed to fetch favorite beers. Please try again.';
    } finally {
      	loading.value = false;
    }
};
  
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    isLoggedIn.value = false;
    favorites.value = [];
};
  
onMounted(async () => {
    if (isLoggedIn.value) {
      	await fetchFavorites();
    }
});
</script>