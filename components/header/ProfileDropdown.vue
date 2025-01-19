<template>
  <div class="relative">
    <button 
      @click="toggleDropdown"
      class="flex items-center space-x-2 focus:outline-none"
    >
      <div class="w-10 h-10 bg-[#1B4D4B] rounded-full flex items-center justify-center">
        <span class="text-white text-sm">JD</span>
      </div>
      <span class="text-[#1B4D4B] hover:text-[#2A6967]">Profile</span>
    </button>

    <div 
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
    >
      <button 
        v-for="item in menuItems" 
        :key="item.label"
        @click="handleItemClick(item.action)"
        class="w-full px-4 py-2 text-left text-[#1B4D4B] hover:bg-[#E8EFEE] flex items-center space-x-2"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/vue/24/outline';

interface MenuItem {
  label: string;
  icon: any;
  action: string;
}

const isOpen = ref(false);

const menuItems: MenuItem[] = [
  { label: 'Upload', icon: UserIcon, action: 'upload' },
  { label: 'Settings', icon: Cog6ToothIcon, action: 'settings' },
  { label: 'Logout', icon: ArrowRightOnRectangleIcon, action: 'logout' }
];

const emit = defineEmits<{
  (e: 'action', action: string): void;
}>();

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleItemClick = (action: string) => {
  emit('action', action);
  isOpen.value = false;
};

onMounted(() => {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) {
      isOpen.value = false;
    }
  });
});
</script>