import type { Messages } from "../types";

const categories: Messages["categories"] = {
  payments: { label: "Płatności", description: "Przychodzące płatności, przelewy bez numeru faktury i środki wychodzące z Twojego portfela." },
  exceptions: { label: "Rozbieżności", description: "Nadpłaty i duplikaty, które wymagają decyzji, oraz informacja o ich rozwiązaniu." },
  resolutions: { label: "Rozwiązania", description: "Linki do rozwiązania sprawy, propozycje klientów, zatwierdzenia i wykonane plany." },
  refunds: { label: "Zwroty", description: "Zwroty podpisane, potwierdzone w sieci, nieudane lub wygasłe." },
  invoices: { label: "Faktury", description: "Nowe faktury, faktury opłacone w całości lub po terminie oraz wykorzystane saldo klienta." },
  customers: { label: "Klienci", description: "Nowi klienci dodani do tej firmy." },
  team: { label: "Zespół i portfele", description: "Dołączenie, zmiana roli lub odejście członków zespołu oraz zmiany portfeli odbiorczych." },
};

export default categories;
