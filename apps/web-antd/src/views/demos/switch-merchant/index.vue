<script lang="ts" setup>
import { computed, ref } from 'vue';

import { SearchOutlined } from '@ant-design/icons-vue';

import MerchantCard from './components/MerchantCard.vue';

interface Merchant {
  id: string;
  name: string;
  description: string;
  subMerchantCount: number;
  userCount: number;
}

const selectedMerchant = ref<string>('vincom-retail');
const searchQuery = ref<string>('');

const merchants: Merchant[] = [
  {
    id: 'microtec',
    name: 'Microtec',
    description: 'Công ty cổ phần công nghệ Microtec',
    subMerchantCount: 4,
    userCount: 12,
  },
  {
    id: 'vinpearl',
    name: 'Vinpearl',
    description: 'Công ty cổ phần du lịch Vinpearl',
    subMerchantCount: 4,
    userCount: 12,
  },
  {
    id: 'vincom-retail',
    name: 'Vincom Retail',
    description: 'Công ty cổ phần du lịch Vinpearl',
    subMerchantCount: 4,
    userCount: 12,
  },
  {
    id: 'vinfa',
    name: 'VinFa',
    description: 'Công ty cổ phần du lịch Vinpearl',
    subMerchantCount: 4,
    userCount: 12,
  },
  {
    id: 'vin-commerce',
    name: 'Vin Commerce',
    description: 'Công ty cổ phần du lịch Vinpearl',
    subMerchantCount: 4,
    userCount: 12,
  },
  {
    id: 'vinpro',
    name: 'VinPro',
    description: 'Công ty cổ phần du lịch Vinpearl',
    subMerchantCount: 4,
    userCount: 12,
  },
  {
    id: 'vinfast',
    name: 'Vinfast',
    description: 'Công ty cổ phần du lịch Vinpearl',
    subMerchantCount: 4,
    userCount: 12,
  },
  {
    id: 'vinschool',
    name: 'Vinschool',
    description: 'Công ty cổ phần du lịch Vinpearl',
    subMerchantCount: 4,
    userCount: 12,
  },
  {
    id: 'vinmec',
    name: 'VinMec',
    description: 'Công ty cổ phần du lịch Vinpearl',
    subMerchantCount: 4,
    userCount: 12,
  },
];

const filteredMerchants = computed(() => {
  if (!searchQuery.value) return merchants;
  return merchants.filter((merchant) =>
    merchant.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="space-y-6 bg-gray-50 p-8">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-gray-900">Switch merchant</h1>
      <p class="text-sm text-gray-500">You are a member of 8 merchants</p>
      <p class="text-sm text-gray-500">
        Select the merchant you want to access
      </p>
    </div>

    <!-- Search Input -->
    <div class="flex items-center gap-2 rounded-lg bg-white px-4 py-2">
      <SearchOutlined class="h-5 w-5 text-gray-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search"
        class="flex-1 border-0 bg-transparent placeholder-gray-400 outline-none"
      />
    </div>

    <!-- Merchant Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <MerchantCard
        v-for="merchant in filteredMerchants"
        :key="merchant.id"
        :name="merchant.name"
        :description="merchant.description"
        :sub-merchant-count="merchant.subMerchantCount"
        :user-count="merchant.userCount"
        :is-selected="selectedMerchant === merchant.id"
        @select="selectedMerchant = merchant.id"
      />
    </div>
  </div>
</template>
