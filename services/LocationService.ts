export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type?: "popular" | "business" | "residential" | "transport";
}

export interface Route {
  distance: number; // en km
  estimatedTime: number; // en minutos
  points: { lat: number; lng: number }[];
}

class LocationService {
  // Ubicaciones predefinidas de Tegucigalpa/Honduras
  private readonly cityLocations: Location[] = [
    // Centros comerciales
    {
      id: "mall-multiplaza",
      name: "Mall Multiplaza",
      address: "Blvd. Juan Pablo II, Tegucigalpa",
      lat: 14.0723,
      lng: -87.1921,
      type: "business",
    },
    {
      id: "city-mall",
      name: "City Mall",
      address: "Carretera a Olancho, Tegucigalpa",
      lat: 14.0854,
      lng: -87.1654,
      type: "business",
    },
    {
      id: "plaza-criolla",
      name: "Plaza Criolla",
      address: "Col. Palmira, Tegucigalpa",
      lat: 14.0912,
      lng: -87.2156,
      type: "business",
    },

    // Transporte
    {
      id: "aeropuerto",
      name: "Aeropuerto Internacional Toncontín",
      address: "Aeropuerto Toncontín, Tegucigalpa",
      lat: 14.0608,
      lng: -87.2172,
      type: "transport",
    },
    {
      id: "terminal-buses",
      name: "Terminal de Buses",
      address: "Comayagüela, Tegucigalpa",
      lat: 14.084,
      lng: -87.2234,
      type: "transport",
    },

    // Universidades
    {
      id: "unah",
      name: "Universidad Nacional Autónoma de Honduras",
      address: "Ciudad Universitaria, Tegucigalpa",
      lat: 14.084,
      lng: -87.2063,
      type: "popular",
    },
    {
      id: "unitec",
      name: "Universidad Tecnológica Centroamericana",
      address: "Col. San José, Tegucigalpa",
      lat: 14.1023,
      lng: -87.1876,
      type: "popular",
    },

    // Hospitales
    {
      id: "hospital-escuela",
      name: "Hospital Escuela",
      address: "Barrio Abajo, Tegucigalpa",
      lat: 14.0756,
      lng: -87.2089,
      type: "popular",
    },
    {
      id: "hospital-hondureno",
      name: "Hospital Hondureño",
      address: "Col. Humuya, Tegucigalpa",
      lat: 14.0934,
      lng: -87.1823,
      type: "popular",
    },

    // Zonas residenciales populares
    {
      id: "col-kennedy",
      name: "Colonia Kennedy",
      address: "Col. Kennedy, Tegucigalpa",
      lat: 14.1045,
      lng: -87.1789,
      type: "residential",
    },
    {
      id: "col-palmira",
      name: "Colonia Palmira",
      address: "Col. Palmira, Tegucigalpa",
      lat: 14.0923,
      lng: -87.2134,
      type: "residential",
    },
    {
      id: "res-lomas-guijarro",
      name: "Residencial Lomas del Guijarro",
      address: "Lomas del Guijarro, Tegucigalpa",
      lat: 14.1123,
      lng: -87.1634,
      type: "residential",
    },

    // Centro histórico y gobierno
    {
      id: "centro-historico",
      name: "Centro Histórico",
      address: "Centro de Tegucigalpa",
      lat: 14.0722,
      lng: -87.2067,
      type: "popular",
    },
    {
      id: "casa-presidencial",
      name: "Casa Presidencial",
      address: "Col. Loma Linda Norte, Tegucigalpa",
      lat: 14.1156,
      lng: -87.1567,
      type: "popular",
    },

    // Restaurantes y entretenimiento
    {
      id: "zona-viva",
      name: "Zona Viva",
      address: "Col. San Carlos, Tegucigalpa",
      lat: 14.0889,
      lng: -87.1923,
      type: "popular",
    },
    {
      id: "paseo-liquidambar",
      name: "Paseo Liquidámbar",
      address: "Col. Lomas del Mayab, Tegucigalpa",
      lat: 14.1089,
      lng: -87.1712,
      type: "business",
    },
  ];

  // Simular detección de ubicación actual
  async getCurrentLocation(): Promise<Location> {
    // Simular tiempo de carga del GPS
    await this.delay(1500);

    // Por defecto, simular que el usuario está en el centro
    const defaultLocation: Location = {
      id: "current-location",
      name: "Mi ubicación actual",
      address: "Ubicación detectada automáticamente",
      lat: 14.0722 + (Math.random() - 0.5) * 0.01, // Agregar algo de variación
      lng: -87.2067 + (Math.random() - 0.5) * 0.01,
      type: "popular",
    };

    return defaultLocation;
  }

  // Buscar lugares por nombre
  searchPlaces(query: string): Location[] {
    if (!query || query.length < 2) return this.getPopularLocations();

    const searchTerm = query.toLowerCase();
    return this.cityLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchTerm) ||
        location.address.toLowerCase().includes(searchTerm)
    );
  }

  // Obtener ubicaciones populares
  getPopularLocations(): Location[] {
    return this.cityLocations
      .filter((loc) => loc.type === "popular")
      .slice(0, 8);
  }

  // Obtener todas las ubicaciones por categoría
  getLocationsByType(type: Location["type"]): Location[] {
    return this.cityLocations.filter((loc) => loc.type === type);
  }

  // Calcular distancia entre dos puntos usando fórmula de Haversine
  calculateDistance(origin: Location, destination: Location): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(destination.lat - origin.lat);
    const dLng = this.deg2rad(destination.lng - origin.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(origin.lat)) *
        Math.cos(this.deg2rad(destination.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  }

  // Calcular ruta simulada entre dos puntos
  async calculateRoute(
    origin: Location,
    destination: Location
  ): Promise<Route> {
    // Simular tiempo de cálculo de ruta
    await this.delay(800);

    const distance = this.calculateDistance(origin, destination);
    const estimatedTime = Math.ceil(distance * 3 + 5); // Aproximadamente 3 min por km + 5 min base

    // Generar puntos intermedios simulados para la ruta
    const points = this.generateRoutePoints(origin, destination);

    return {
      distance,
      estimatedTime,
      points,
    };
  }

  // Generar puntos intermedios para simular una ruta
  private generateRoutePoints(
    origin: Location,
    destination: Location
  ): { lat: number; lng: number }[] {
    const points = [{ lat: origin.lat, lng: origin.lng }];

    // Generar 3-5 puntos intermedios
    const numPoints = Math.floor(Math.random() * 3) + 3;

    for (let i = 1; i < numPoints; i++) {
      const ratio = i / numPoints;
      const lat =
        origin.lat +
        (destination.lat - origin.lat) * ratio +
        (Math.random() - 0.5) * 0.005;
      const lng =
        origin.lng +
        (destination.lng - origin.lng) * ratio +
        (Math.random() - 0.5) * 0.005;
      points.push({ lat, lng });
    }

    points.push({ lat: destination.lat, lng: destination.lng });
    return points;
  }

  // Obtener conductores disponibles cerca de una ubicación (versión actualizada)
  async getAvailableDriversNearFromConnected(
    location: Location,
    connectedDrivers: Array<{
      id: string;
      name: string;
      isOnline: boolean;
      currentLocation: Location;
      rating: number;
      vehicleInfo: {
        make: string;
        model: string;
        color: string;
        plate: string;
      };
    }>,
    radiusKm: number = 5
  ): Promise<
    Array<{
      id: string;
      name: string;
      rating: number;
      distance: number;
      estimatedArrival: number;
      vehicleInfo: {
        make: string;
        model: string;
        color: string;
        plate: string;
      };
      currentLocation: Location;
    }>
  > {
    // Simular tiempo de búsqueda
    await this.delay(1000);

    // Filtrar conductores conectados y online, calcular distancias
    const availableDrivers = connectedDrivers
      .filter((driver) => driver.isOnline)
      .map((driver) => {
        const distance = this.calculateDistance(
          location,
          driver.currentLocation
        );
        const estimatedArrival = Math.ceil(distance * 2 + Math.random() * 3); // 2 min por km + variación

        return {
          ...driver,
          distance,
          estimatedArrival,
        };
      })
      .filter((driver) => driver.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance); // Ordenar por distancia

    return availableDrivers;
  }

  // Obtener conductores disponibles cerca de una ubicación (versión original para fallback)
  async getAvailableDriversNear(
    location: Location,
    radiusKm: number = 5
  ): Promise<
    Array<{
      id: string;
      name: string;
      rating: number;
      distance: number;
      estimatedArrival: number;
      vehicleInfo: {
        make: string;
        model: string;
        color: string;
        plate: string;
      };
      currentLocation: Location;
    }>
  > {
    // Simular tiempo de búsqueda
    await this.delay(1000);

    // Conductores mock disponibles
    const mockDrivers = [
      {
        id: "driver-001",
        name: "Carlos Ruiz",
        rating: 4.8,
        vehicleInfo: {
          make: "Toyota",
          model: "Corolla",
          color: "Blanco",
          plate: "ABC-123",
        },
        baseLocation: { lat: 14.0756, lng: -87.2089 },
      },
      {
        id: "driver-002",
        name: "María González",
        rating: 4.9,
        vehicleInfo: {
          make: "Nissan",
          model: "Sentra",
          color: "Gris",
          plate: "XYZ-789",
        },
        baseLocation: { lat: 14.084, lng: -87.2063 },
      },
      {
        id: "driver-003",
        name: "Roberto López",
        rating: 4.7,
        vehicleInfo: {
          make: "Honda",
          model: "Civic",
          color: "Negro",
          plate: "DEF-456",
        },
        baseLocation: { lat: 14.0923, lng: -87.2134 },
      },
    ];

    // Filtrar conductores dentro del radio y calcular distancias
    const availableDrivers = mockDrivers
      .map((driver) => {
        const driverLocation: Location = {
          id: `loc-${driver.id}`,
          name: `Ubicación de ${driver.name}`,
          address: "En ruta",
          lat: driver.baseLocation.lat + (Math.random() - 0.5) * 0.02,
          lng: driver.baseLocation.lng + (Math.random() - 0.5) * 0.02,
        };

        const distance = this.calculateDistance(location, driverLocation);
        const estimatedArrival = Math.ceil(distance * 2 + Math.random() * 3); // 2 min por km + variación

        return {
          ...driver,
          distance,
          estimatedArrival,
          currentLocation: driverLocation,
        };
      })
      .filter((driver) => driver.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance); // Ordenar por distancia

    return availableDrivers;
  }

  // Simular estimación de tarifa
  calculateFareEstimate(
    distance: number,
    serviceType: "economico" | "ejecutivo" = "economico"
  ): {
    min: number;
    max: number;
    suggested: number;
  } {
    const baseRate = serviceType === "economico" ? 5.0 : 12.0;
    const perKmRate = serviceType === "economico" ? 2.5 : 4.0;

    const baseFare = baseRate + distance * perKmRate;

    return {
      min: Math.round(baseFare * 0.8 * 100) / 100,
      max: Math.round(baseFare * 1.2 * 100) / 100,
      suggested: Math.round(baseFare * 100) / 100,
    };
  }

  // Utilidades privadas
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Obtener ubicación por ID
  getLocationById(id: string): Location | undefined {
    return this.cityLocations.find((loc) => loc.id === id);
  }

  // Validar si una ubicación está dentro del área de servicio
  isWithinServiceArea(location: Location): boolean {
    // Definir área de servicio de Tegucigalpa (aproximada)
    const serviceArea = {
      north: 14.15,
      south: 14.05,
      east: -87.15,
      west: -87.25,
    };

    return (
      location.lat >= serviceArea.south &&
      location.lat <= serviceArea.north &&
      location.lng >= serviceArea.west &&
      location.lng <= serviceArea.east
    );
  }
}

export const locationService = new LocationService();
