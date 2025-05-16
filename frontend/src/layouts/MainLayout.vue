<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Craft Beer Rating
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view/>
    </q-page-container>
    <q-footer elevated>
        <q-tabs>
          <q-route-tab name="Beers" icon="sports_bar" label="Beers" to="/"/>
          <q-route-tab name="Profile" icon="account_circle" label="Profile" to="/profile" />
        </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">

</script>
