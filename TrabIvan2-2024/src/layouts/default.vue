<template>
  <v-app id="inspire">
    <v-app-bar
      class="px-3"
      density="compact"
      flat
    >
      <v-avatar
        class="hidden-md-and-up"
        image="https://i.pinimg.com/474x/59/e9/0a/59e90ab5dcaa67691a0619023aa08baa.jpg"
        size="32"
      ></v-avatar>

      <v-spacer></v-spacer>

      <v-tabs
        color="grey-darken-2"
        centered
      >
        <v-tab
          v-for="link in links"
          :key="link"
          :text="link"
        ></v-tab>
      </v-tabs>
      <v-spacer></v-spacer>

      <v-avatar
        class="hidden-sm-and-down"
        image="https://i.pinimg.com/474x/59/e9/0a/59e90ab5dcaa67691a0619023aa08baa.jpg"
        size="38"
      ></v-avatar>
    </v-app-bar>

    <v-main class="black">
      <v-container>
        <v-row>
          <v-col
            cols="20"
            md="12"
          >
            <v-sheet
              min-height="70vh"
              rounded="lg"
            >
              <Crud />
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  const links = [
    'Crud',
  ]
</script>

<script>
  export default {
    data: () => ({
      links: [
        'Crud',
      ],
    }),
  }
</script>
