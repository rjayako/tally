import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import { createPinia } from 'pinia'
import 'fake-indexeddb/auto'

// Mock Nuxt components and composables
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $pinia: createPinia(),
  }),
  defineNuxtPlugin: vi.fn(),
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:3000',
    },
  }),
}))

// Mock Nuxt UI components
config.global.stubs = {
  'NuxtLink': true,
  'NuxtImg': true,
  'NuxtPage': true,
  'ClientOnly': {
    template: '<slot />',
  },
  'Icon': true,
}

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock File API
class MockFile implements Partial<File> {
  name: string
  size: number
  type: string
  lastModified: number
  
  constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
    this.name = name
    this.size = 1024
    this.type = options?.type || ''
    this.lastModified = options?.lastModified || Date.now()
  }
  
  text() {
    return Promise.resolve('mock file content')
  }

  slice() {
    return new Blob()
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0))
  }

  stream() {
    return new ReadableStream()
  }
}

// Use type assertion to avoid TypeScript errors
global.File = MockFile as unknown as typeof File

// Mock FileReader
class MockFileReader implements Partial<FileReader> {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  readyState: number = 0
  result: string | ArrayBuffer | null = null
  error: DOMException | null = null
  
  static readonly EMPTY = 0
  static readonly LOADING = 1
  static readonly DONE = 2
  
  readAsText() {
    setTimeout(() => {
      this.readyState = MockFileReader.DONE
      this.result = 'mock file content'
      
      if (this.onload) {
        const event = { target: { result: 'mock file content' } } as unknown as ProgressEvent<FileReader>
        this.onload.call(this as unknown as FileReader, event)
      }
    }, 0)
  }
}

// Use type assertion to avoid TypeScript errors
global.FileReader = MockFileReader as unknown as typeof FileReader 