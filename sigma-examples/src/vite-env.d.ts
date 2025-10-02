/// <reference types="vite/client" />

// Allow importing .jsonld files as JSON
declare module '*.jsonld' {
  const value: any;
  export default value;
}

// Allow importing CSV files with ?url suffix
declare module '*.csv?url' {
  const value: string;
  export default value;
}
