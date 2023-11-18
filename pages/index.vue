<template>
  <main class="min-h-screen">
    <div v-if="html" class="p-4 relative">
      <iframe
        :srcdoc="html"
        class="w-full overflow-hidden rounded-lg ring-1 ring-slate-900/10 h-screen"
      />
      <UButton
        class="absolute top-6 right-6"
        size="xs"
        color="black"
        label="Download Code"
        @click="downloadCode"
      />
    </div>
    <UContainer v-else>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div
          ref="dropZoneRef"
          class="rounded-lg aspect-[1] bg-gray-100 dark:bg-gray-900 border dark:border-gray-600 flex items-center justify-center mt-2 transition-all overflow-hidden relative"
          :class="{
            'animate-pulse ring-4 ring-teal-500 bg-teal-50 border-teal-500 dark:border-teal-400 ring-opacity-20':
              isOverDropZone,
          }"
          @click="!isOverDropZone && !post.thumbnail && open()"
        >
          <div v-if="!post.thumbnail" class="text-center cursor-pointer">
            <p>Drag the picture here</p>
            <p class="text-xs mt-1 text-gray-500">or click here to upload</p>
          </div>
          <img
            v-else
            :src="imagePreview"
            class="h-full w-full object-cover relative"
          />
          <UButton
            type="button"
            v-if="post.thumbnail"
            icon="i-heroicons-x-mark"
            square
            class="absolute top-2 right-2 z-10"
            color="rose"
            variant="soft"
            @click.stop="post.thumbnail = undefined"
          />
        </div>
        <UInput
          v-model="post.title"
          required
          label="Title"
          placeholder="Explain what do you want to do"
        />
        <UButton
          type="submit"
          size="lg"
          label="Create"
          color="black"
          block
          :loading="loading"
        />
      </form>
    </UContainer>
  </main>
</template>

<script setup>
import { useDropZone, useFileDialog, useClipboard } from "@vueuse/core";
import { nanoid } from "nanoid";
const dropZoneRef = ref();

const { copy } = useClipboard();
const toast = useToast();
const { isOverDropZone } = useDropZone(dropZoneRef, onDrop);
const loading = ref(false);
const file = ref();
const imagePreview = useObjectUrl(file);
const storage = useKv();

function onDrop(files) {
  post.value.thumbnail = files[0];
  file.value = files && files.length > 0 ? files[0] : undefined;
}

const { open, onChange } = useFileDialog({
  accept: "image/*",
});

const post = ref({
  title: undefined,
  thumbnail: undefined,
});

const html = ref(``);

onChange((files) => {
  post.value.thumbnail = files[0];
  file.value = files && files.length > 0 ? files[0] : undefined;
});

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const handleSubmit = async () => {
  loading.value = true;
  const { data } = await useFetch("/api/chat", {
    method: "POST",
    body: {
      text: post.value.title,
      imageUrl: await toBase64(post.value.thumbnail),
    },
  });
  html.value = data.value;
  loading.value = false;
};

const downloadCode = () => {
  const element = document.createElement("a");
  const file = new Blob([html.value], { type: "text/html" });
  element.href = URL.createObjectURL(file);
  element.download = "index.html";
  document.body.appendChild(element);
  element.click();
};

const siteId = ref();
</script>
