export interface TenantBranding {
  id: string;
  name: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;

  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
  };

  borderRadius: number;
}
