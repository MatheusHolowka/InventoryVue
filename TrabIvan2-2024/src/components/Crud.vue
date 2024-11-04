<template>
  <div>
    <v-container>
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers:="headers"
        :items="serverItems"
        :items-length="totalItems"
        :loading="loading"
        :search="search"
        item-value="name"
        @update:options="loadItems"
      >
        <!-- Toolbar com campo de busca e botão de adicionar -->
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Controle de Estoque</v-toolbar-title>
            <v-toolbar-items>
              <v-btn @click="addItem">Adicionar Item</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-container>
            <!-- Campo de pesquisa -->
            <v-text-field
              v-model="searchName"
              label="Pesquisar..."
              variant="underlined"
              :disabled="loading"
            ></v-text-field>
          </v-container>
        </template>

        <!-- Botões de ação -->
        <template v-slot:item.action="{ item }">
          <v-btn icon="mdi-pencil" @click="editItem(item)" class="mr-2" />
          <v-btn icon="mdi-delete" @click="remove(item.uuid)" />
          <v-btn icon="mdi-eye" @click="readItem(item)" />
        </template>
      </v-data-table-server>
    </v-container>

    <!-- Diálogo de Edição/Adição -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>Item de Estoque</v-card-title>
        <v-card-text>
          <v-text-field label="Nome" v-model="inventoryItem.name" />
          <v-text-field label="Descrição" v-model="inventoryItem.description" />
          <v-text-field
            label="Quantidade"
            v-model="inventoryItem.quantity"
            type="number"
          />
          <v-text-field
            label="Preço"
            v-model="inventoryItem.price"
            type="number"
            prefix="R$"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="dialog = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Visualização -->
    <v-dialog v-model="dialogRead" max-width="600">
      <v-card>
        <v-card-title>Visualizar Item</v-card-title>
        <v-card-text>
          <v-text-field label="Nome" v-model="inventoryItem.name" disabled />
          <v-text-field label="Descrição" v-model="inventoryItem.description" disabled />
          <v-text-field label="Quantidade" v-model="inventoryItem.quantity" disabled />
          <v-text-field label="Preço" v-model="inventoryItem.price" disabled prefix="R$" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import debounce from "lodash/debounce";

const inventoryItem = ref({});
const itemsPerPage = ref(10);
const page = ref(1);
const sortBy = ref([]);
const dialog = ref(false);
const dialogRead = ref(false);
const headers = ref([
  { text: "Nome", value: "name" },
  { text: "Descrição", value: "description" },
  { text: "Quantidade", value: "quantity" },
  { text: "Preço", value: "price" },
  { text: "Ações", value: "action", sortable: false },
]);
const serverItems = ref([]);
const totalItems = ref(0);
const loading = ref(false);
const search = ref("");
const searchName = ref("");

const loadItems = async (options) => {
  loading.value = true;
  let url = "http://localhost:5000/inventory?";

  if (options) {
    page.value = options.page ?? 1;
    sortBy.value = options.sortBy ?? [];

    if (sortBy.value.length > 0) {
      url += `sortKey=${sortBy.value[0].key}&sortOrder=${sortBy.value[0].order}&`;
    }

    if (options.search?.length > 0) {
      url += `search=${options.search}&`;
    }

    url += `page=${page.value}&limit=${options.itemsPerPage ?? itemsPerPage.value}`;
  } else {
    url += `page=1&limit=${itemsPerPage.value}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: Não foi possível carregar os itens`);
    }

    const result = await response.json();
    serverItems.value = result.data.map((item) => ({
      ...item,
    }));
    totalItems.value = result.total || 0;
  } catch (error) {
    console.error("Erro ao carregar os itens:", error.message);
  } finally {
    loading.value = false;
  }
};

watch(
  searchName,
  debounce(() => {
    search.value = searchName.value;
  }, 500)
);

const remove = async (uuid) => {
  loading.value = true;
  await fetch("http://localhost:5000/inventory/" + uuid, { method: "DELETE" });
  loadItems({
    page: page.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    search: searchName.value,
  });
  loading.value = false;
};

const save = () => {
  const url = inventoryItem.value.uuid
    ? `http://localhost:5000/inventory/${inventoryItem.value.uuid}`
    : "http://localhost:5000/inventory";

  fetch(url, {
    method: inventoryItem.value.uuid ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inventoryItem.value),
  })
    .then(() => {
      inventoryItem.value = {};
      dialog.value = false;
      loadItems({
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        sortBy: sortBy.value,
        search: searchName.value,
      });
    })
    .catch((error) => console.error(error));
};

// Função para editar item
const editItem = async (item) => {
  dialog.value = false;
  dialogRead.value = false;

  try {
    const response = await fetch(`http://localhost:5000/inventory/${item.uuid}`);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: Não foi possível obter os dados do item`);
    }

    const data = await response.json();
    inventoryItem.value = data[0] || {};

    dialog.value = true;
  } catch (error) {
    console.error("Erro ao carregar o item para edição:", error.message);
  }
};

// Função para adicionar item
const addItem = () => {
  inventoryItem.value = {};
  dialog.value = true;
};

// Função para visualizar item
const readItem = async (item) => {
  dialog.value = false;
  dialogRead.value = false;

  try {
    const response = await fetch(`http://localhost:5000/inventory/${item.uuid}`);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: Não foi possível obter os dados do item`);
    }

    const data = await response.json();
    inventoryItem.value = data[0] || {};

    dialogRead.value = true;
  } catch (error) {
    console.error("Erro ao carregar o item para visualização:", error.message);
  }
};
</script>
