<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  createClient,
  deleteClient,
  fetchClients,
  updateClient,
} from '../plugins/clients'
import AppFooter from '../components/AppFooter.vue'
import AppHeader from '../components/AppHeader.vue'
import { useClientFormatting } from '../Mixins/useClientFormatting'

const { formatAmount, getClientName } = useClientFormatting()

const clients = ref([])
const loading = ref(true)
const saving = ref(false)
const deletingId = ref(null)
const error = ref('')
const notice = ref('')
const searchInput = ref('')
const activePhone = ref('')
const isFormOpen = ref(false)
const editingClient = ref(null)

const emptyForm = () => ({
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  employee_count: '',
  project_budget: '',
})

const form = reactive(emptyForm())

const totalBudget = computed(() =>
  clients.value.reduce(
    (total, client) => total + Number(client.project_budget || 0),
    0,
  ),
)

async function loadClients(phone = '') {
  loading.value = true
  error.value = ''

  try {
    clients.value = await fetchClients(phone)
    activePhone.value = phone
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

function searchClients() {
  notice.value = ''
  loadClients(searchInput.value.trim())
}

function clearSearch() {
  searchInput.value = ''
  notice.value = ''
  loadClients()
}

function openCreateForm() {
  editingClient.value = null
  Object.assign(form, emptyForm())
  error.value = ''
  notice.value = ''
  isFormOpen.value = true
}

function openEditForm(client) {
  editingClient.value = client
  Object.assign(form, {
    name: getClientName(client),
    email: client.email || '',
    phone: client.phone || '',
    company: client.company || '',
    address: client.address || '',
    employee_count: client.company_employee_count ?? 100,
    project_budget: client.project_budget ?? '',
  })
  error.value = ''
  notice.value = ''
  isFormOpen.value = true
}

function closeForm() {
  if (!saving.value) isFormOpen.value = false
}

async function saveClient() {
  error.value = ''
  notice.value = ''
  saving.value = true

  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    company: form.company.trim(),
    address: form.address.trim(),
    company_employee_count: Number(form.employee_count),
    project_budget: Number(form.project_budget),
  }

  try {
    if (editingClient.value) {
      await updateClient(editingClient.value.id, {
        phone: payload.phone,
        address: payload.address,
        company_employee_count: payload.company_employee_count,
        project_budget: payload.project_budget,
      })
      notice.value = 'Client details updated.'
    } else {
      await createClient(payload)
      notice.value = 'Client added successfully.'
    }
    isFormOpen.value = false
    await loadClients(activePhone.value)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    saving.value = false
  }
}

async function removeClient(client) {
  const name = getClientName(client)
  if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return

  error.value = ''
  notice.value = ''
  deletingId.value = client.id

  try {
    await deleteClient(client.id)
    notice.value = `${name} was deleted.`
    await loadClients(activePhone.value)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    deletingId.value = null
  }
}

onMounted(() => loadClients())
</script>

<template>
  <div class="app-shell">
    <AppHeader />

    <main class="page-content">
      <section
        class="welcome-row"
        aria-labelledby="page-title"
      >
        <div>
          <p class="eyebrow">
            OVERVIEW
          </p>
          <h1 id="page-title">
            Clients
          </h1>
          <p class="page-description">
            Keep your client relationships and project figures in one place.
          </p>
        </div>
        <button
          class="button button-primary"
          type="button"
          @click="openCreateForm"
        >
          <span
            class="button-plus"
            aria-hidden="true"
          >+</span>
          Add client
        </button>
      </section>

      <section
        class="summary-grid"
        aria-label="Client summary"
      >
        <article class="summary-card">
          <div
            class="summary-icon icon-people"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20m14-11a3 3 0 1 1 0 6m4 5v-1.6a3.4 3.4 0 0 0-2.5-3.28M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            </svg>
          </div>
          <div>
            <p class="summary-label">
              Total clients
            </p>
            <p class="summary-value">
              {{ loading ? '—' : clients.length }}
            </p>
          </div>
          <span class="summary-note">in this view</span>
        </article>

        <article class="summary-card">
          <div
            class="summary-icon icon-budget"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M12 3v18m4-14.5c-.7-1-2-1.5-4-1.5-2.2 0-4 1.1-4 3s1.3 2.7 4 3.5 4 1.6 4 3.5-1.8 3-4 3c-1.8 0-3.4-.6-4.2-1.8" />
            </svg>
          </div>
          <div>
            <p class="summary-label">
              Project budgets
            </p>
            <p class="summary-value">
              {{ loading ? '—' : formatAmount(totalBudget) }}
            </p>
          </div>
          <span class="summary-note">total in this view</span>
        </article>
      </section>

      <section
        class="clients-panel"
        aria-labelledby="clients-heading"
      >
        <div class="panel-heading">
          <div>
            <h2 id="clients-heading">
              All clients
            </h2>
            <p class="panel-subtitle">
              {{ activePhone ? `Results for “${activePhone}”` : 'Client details and project values' }}
            </p>
          </div>
          <form
            class="search-form"
            role="search"
            @submit.prevent="searchClients"
          >
            <label class="search-box">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="8.8"
                  cy="8.8"
                  r="5.8"
                />
                <path d="m13.2 13.2 4 4" />
              </svg>
              <input
                v-model="searchInput"
                aria-label="Search clients by phone"
                inputmode="tel"
                placeholder="Search by phone"
                type="search"
              >
            </label>
            <button
              class="button button-search"
              type="submit"
              :disabled="loading"
            >
              Search
            </button>
            <button
              v-if="activePhone || searchInput"
              class="clear-search"
              type="button"
              @click="clearSearch"
            >
              Clear
            </button>
          </form>
        </div>

        <div
          v-if="error"
          class="message message-error"
          role="alert"
        >
          <span>{{ error }}</span>
          <button
            class="message-close"
            type="button"
            aria-label="Dismiss error"
            @click="error = ''"
          >
            ×
          </button>
        </div>
        <div
          v-if="notice"
          class="message message-success"
          role="status"
        >
          <span>{{ notice }}</span>
          <button
            class="message-close"
            type="button"
            aria-label="Dismiss message"
            @click="notice = ''"
          >
            ×
          </button>
        </div>

        <div class="table-scroll">
          <table class="clients-table">
            <thead>
              <tr>
                <th scope="col">
                  CLIENT
                </th>
                <th scope="col">
                  CONTACT
                </th>
                <th scope="col">
                  COMPANY
                </th>
                <th scope="col">
                  ADDRESS
                </th>
                <th scope="col">
                  PROJECT BUDGET
                </th>
                <th scope="col">
                  SERVICE CHARGE
                </th>
                <th scope="col">
                  DISCOUNT
                </th>
                <th scope="col">
                  FINAL VALUE
                </th>
                <th scope="col">
                  <span class="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td
                  class="table-state"
                  colspan="9"
                >
                  <span
                    class="spinner"
                    aria-hidden="true"
                  />
                  Loading clients…
                </td>
              </tr>
              <tr v-else-if="!clients.length">
                <td
                  class="table-state empty-state"
                  colspan="9"
                >
                  <span
                    class="empty-icon"
                    aria-hidden="true"
                  >◎</span>
                  <strong>{{ activePhone ? 'No matching clients' : 'No clients yet' }}</strong>
                  <span>
                    {{ activePhone ? 'Try another phone number or clear your search.' : 'Add your first client to get started.' }}
                  </span>
                  <button
                    v-if="!activePhone"
                    class="button button-secondary"
                    type="button"
                    @click="openCreateForm"
                  >
                    Add your first client
                  </button>
                </td>
              </tr>
              <tr
                v-for="client in clients"
                v-else
                :key="client.id"
              >
                <td>
                  <div class="client-cell">
                    <span
                      class="avatar"
                      aria-hidden="true"
                    >
                      {{ getClientName(client).slice(0, 1).toUpperCase() }}
                    </span>
                    <span class="client-name">{{ getClientName(client) }}</span>
                  </div>
                </td>
                <td>
                  <span class="contact-phone">{{ client.phone || '—' }}</span>
                  <span class="contact-email">{{ client.email || '—' }}</span>
                </td>
                <td>
                  <span class="company-name">{{ client.company || '—' }}</span>
                </td>
                <td class="address-cell">
                  {{ client.address || '—' }}
                </td>
                <td class="number-cell">
                  {{ formatAmount(client.project_budget) }}
                </td>
                <td class="number-cell">
                  {{ formatAmount(client.service_charge) }}
                </td>
                <td class="number-cell discount-cell">
                  {{ formatAmount(client.discount_value) }}
                </td>
                <td class="number-cell final-cell">
                  {{ formatAmount(client.final_project_value) }}
                </td>
                <td>
                  <div class="row-actions">
                    <button
                      class="icon-button"
                      type="button"
                      :aria-label="`Edit ${getClientName(client)}`"
                      title="Edit client"
                      @click="openEditForm(client)"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="m12.8 4.2 3 3M3 17l3.2-.7L16.2 6.3a2.12 2.12 0 0 0-3-3L3.2 13.3 3 17Z" />
                      </svg>
                    </button>
                    <button
                      class="icon-button icon-button-danger"
                      type="button"
                      :aria-label="`Delete ${getClientName(client)}`"
                      title="Delete client"
                      :disabled="deletingId === client.id"
                      @click="removeClient(client)"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M4 6h12m-10.5 0 .7 10h7.6l.7-10M8 6V4h4v2m-3 3v4m2-4v4" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <span>
            Showing <strong>{{ loading ? '—' : clients.length }}</strong>
            {{ clients.length === 1 ? 'client' : 'clients' }}
          </span>
          <span class="footer-note">Service charges and discounts are calculated by your API.</span>
        </div>
      </section>
      <AppFooter />
    </main>

    <div
      v-if="isFormOpen"
      class="modal-backdrop"
      @click.self="closeForm"
    >
      <section
        class="client-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="editingClient ? 'edit-client-title' : 'add-client-title'"
      >
        <div class="modal-heading">
          <div>
            <p class="eyebrow">
              {{ editingClient ? 'CLIENT DETAILS' : 'NEW CLIENT' }}
            </p>
            <h2 :id="editingClient ? 'edit-client-title' : 'add-client-title'">
              {{ editingClient ? 'Edit client' : 'Add a client' }}
            </h2>
            <p class="modal-subtitle">
              {{ editingClient ? 'Update the phone, address, employee count, or project budget.' : 'Enter the client and project details below.' }}
            </p>
          </div>
          <button
            class="modal-close"
            type="button"
            aria-label="Close dialog"
            @click="closeForm"
          >
            ×
          </button>
        </div>

        <form
          class="client-form"
          @submit.prevent="saveClient"
        >
          <template v-if="!editingClient">
            <label class="field">
              <span>Client name <b>*</b></span>
              <input
                v-model="form.name"
                autocomplete="name"
                maxlength="255"
                required
              >
            </label>
            <label class="field">
              <span>Email address <b>*</b></span>
              <input
                v-model="form.email"
                autocomplete="email"
                maxlength="255"
                required
                type="email"
              >
            </label>
            <label class="field">
              <span>Phone number <b>*</b></span>
              <input
                v-model="form.phone"
                autocomplete="tel"
                maxlength="30"
                required
                type="tel"
              >
            </label>
            <label class="field">
              <span>Company <b>*</b></span>
              <input
                v-model="form.company"
                autocomplete="organization"
                maxlength="255"
                required
              >
            </label>
          </template>
          <label class="field field-full">
            <span>Address <b>*</b></span>
            <textarea
              v-model="form.address"
              autocomplete="street-address"
              maxlength="1000"
              required
              rows="2"
            />
          </label>
          <label class="field field-full">
            <span>Number of employees <b>*</b></span>
            <input
              v-model="form.employee_count"
              min="0"
              required
              step="1"
              type="number"
            >
          </label>
          <label class="field field-full">
            <span>Project budget <b>*</b></span>
            <span class="input-with-prefix">
              <input
                v-model="form.project_budget"
                min="0.01"
                placeholder="0.00"
                required
                step="0.01"
                type="number"
              >
            </span>
          </label>
          <p
            v-if="editingClient"
            class="form-hint field-full"
          >
            The API will recalculate the service charge, discount, and final project value.
          </p>
          <p
            v-if="error"
            class="form-error field-full"
            role="alert"
          >
            {{ error }}
          </p>
          <div class="form-actions field-full">
            <button
              class="button button-secondary"
              type="button"
              :disabled="saving"
              @click="closeForm"
            >
              Cancel
            </button>
            <button
              class="button button-primary"
              type="submit"
              :disabled="saving"
            >
              {{ saving ? 'Saving…' : editingClient ? 'Save changes' : 'Add client' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
