// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";

// PrimeVue components (import only components we will register globally)
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Paginator from "primevue/paginator";
import Dropdown from "primevue/dropdown";
import Tooltip from "primevue/tooltip";

// CSS imports are handled via local files (you already served them from /vendor or index.html).
import "./assets/sakai-overrides.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

// PrimeVue + services
app.use(PrimeVue, { ripple: true });
app.use(ToastService);         // for this.$toast(...)
app.use(ConfirmationService);  // for this.$confirm(...)

// Global components registration (names match your templates: PToast, PConfirmDialog, ...)
app.component("PToast", Toast);
app.component("PConfirmDialog", ConfirmDialog);
app.component("PButton", Button);
app.component("PDialog", Dialog);
app.component("PDataTable", DataTable);
app.component("PColumn", Column);
app.component("PInputText", InputText);
app.component("PCheckbox", Checkbox);
app.component("PPaginator", Paginator);
app.component("PDropdown", Dropdown);

// Optional: directive registration (e.g., tooltip)
app.directive("tooltip", Tooltip);

// mount
app.mount("#app");
