export const themeColors = {
  light: {
    '--text-color': '#000000',
    '--bg-color': '#ffffff',
    '--border-color': '#000000',
    '--error-color': '#ff0000',
    '--button-bg': '#000000',
    '--button-text': '#ffffff',
    '--button-disabled': '#666666',
    '--divider-color': '#000000',
    '--sidebar-bg': '#2c3e50',
    '--sidebar-text': '#ffffff',
    '--sidebar-hover': '#34495e',
    '--sidebar-active': '#3498db',
    '--content-bg': '#f5f7fa',
    '--table-border': '#ddd',
    '--table-header-bg': '#f5f5f5',
    '--table-stripe-bg': '#f9f9f9',
  },
  dark: {
    '--text-color': '#000000',
    '--bg-color': '#ffffff',
    '--border-color': '#000000',
    '--error-color': '#ff0000',
    '--button-bg': '#000000',
    '--button-text': '#ffffff',
    '--button-disabled': '#666666',
    '--divider-color': '#000000',
    '--sidebar-bg': '#2c3e50',
    '--sidebar-text': '#ffffff',
    '--sidebar-hover': '#34495e',
    '--sidebar-active': '#3498db',
    '--content-bg': '#f5f7fa',
    '--table-border': '#ddd',
    '--table-header-bg': '#f5f5f5',
    '--table-stripe-bg': '#2a2a2a',
  }
};

export const initTheme = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const colors = isDark ? themeColors.dark : themeColors.light;
  
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}; 