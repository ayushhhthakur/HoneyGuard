import axios from "axios";
import API_URL from "../config/api";

// Every resource module in src/api/ builds its URLs from this. axios itself
// is already wired up (auth + x-org-id headers) globally by lib/http.js —
// this file exists so resource modules don't each re-import 'axios' and
// 're-derive' API_URL string concatenation individually.
export { axios, API_URL };
