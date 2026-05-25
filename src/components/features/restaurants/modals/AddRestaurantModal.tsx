"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useJsApiLoader, GoogleMap, MarkerF, Autocomplete } from "@react-google-maps/api";
import FullPageModal from "@/components/ui/FullPageModal";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Radio from "@/components/ui/Radio";
import Icon from "@/components/ui/Icon";
import { FiCheck } from "react-icons/fi";
import type { Restaurant } from "@/types/domain/restaurants";

const GOOGLE_MAP_LIBRARIES: ("places")[] = ["places"];

const restaurantFormSchema = z
  .object({
    name: z.string().min(1, "Restaurant name is required").max(100, "Name must be less than 100 characters"),
    pincode: z.string().min(1, "Pincode is required").max(20, "Pincode must be less than 20 characters"),
    state: z.string().min(1, "State is required").max(50, "State must be less than 50 characters"),
    city: z.string().min(1, "City is required").max(50, "City must be less than 50 characters"),
    line1: z.string().min(1, "Line 1 is required").max(255, "Line 1 must be less than 255 characters"),
    line2: z.string().min(1, "Line 2 is required").max(255, "Line 2 must be less than 255 characters"),
    status: z.enum(["active", "suspended"]),
    location: z.string().optional(),
    google_place_id: z.string().trim().min(1, "Please select a location from map/search"),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  });

export type RestaurantFormData = z.infer<typeof restaurantFormSchema>;

export interface AddRestaurantModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RestaurantFormData) => void;
  loading?: boolean;
  restaurant?: Restaurant | null;
}

interface FormFieldProps {
  name: keyof RestaurantFormData;
  label: string;
  placeholder: string;
  className?: string;
  register: UseFormRegister<RestaurantFormData>;
  errors: FieldErrors<RestaurantFormData>;
  focusedInput: string | null;
  setFocusedInput: (field: string | null) => void;
  width?: string;
  maxLength?: number;
  [key: string]: any;
}

function FormField({
  name,
  label,
  placeholder,
  className = "",
  register,
  errors,
  focusedInput,
  setFocusedInput,
  width = "w-full",
  maxLength,
  ...rest
}: FormFieldProps) {
  const field = register(name);
  const { onBlur, onChange, ...fieldProps } = field;
  const externalOnChange = rest.onChange;

  return (
    <div>
      <label className="block text-base text-[var(--color-neutral-secondary)] font-normal mb-4">
        {label}
      </label>
      <Input
        className={`${width} h-12 px-4 rounded-lg text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)] border border-[#E0E3E1] transition-all duration-200 ${className}`}
        placeholder={placeholder}
        isFocused={focusedInput === name}
        maxLength={maxLength}
        onFocus={() => setFocusedInput(name)}
        onChange={(e) => {
          onChange(e);
          if (typeof externalOnChange === "function") {
            externalOnChange(e);
          }
        }}
        onBlur={(e) => {
          onBlur(e);
          setFocusedInput(null);
        }}
        {...fieldProps}
        {...rest}
      />
      {errors[name] && (
        <p className="text-sm text-red-500 mt-1">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

export default function AddRestaurantModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  restaurant = null,
}: AddRestaurantModalProps) {
  const isEditMode = Boolean(restaurant);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const mapsRef = useRef<HTMLDivElement | null>(null);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { isLoaded: isMapsLoaded, loadError: mapsLoadError } = useJsApiLoader({
    id: "restaurant-location-map-script",
    googleMapsApiKey,
    libraries: GOOGLE_MAP_LIBRARIES,
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
    watch,
    reset,
    setValue,
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantFormSchema),
    mode: "onChange",
    defaultValues: {
      name: restaurant?.name || "",
      pincode: restaurant?.pincode || "",
      state: restaurant?.state || "",
      city: restaurant?.city || "",
      line1: restaurant?.line_one || "",
      line2: restaurant?.line_two || "",
      status: restaurant?.status?.toLowerCase() === "suspended" ? "suspended" : "active",
      location: restaurant?.address || "",
      google_place_id: restaurant?.google_place_id || "",
      latitude: restaurant?.latitude?.toString() || "",
      longitude: restaurant?.longitude?.toString() || "",
    },
  });

  useEffect(() => {
  }, [errors]);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [mapQuery, setMapQuery] = useState<string>(restaurant?.address || "");
  const status = watch("status");
  const location = watch("location") || "";
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const center = useMemo(() => {
    if (latitude && longitude) {
      return { lat: Number(latitude), lng: Number(longitude) };
    }
    return { lat: 28.6139, lng: 77.2090 }; // Delhi
  }, [latitude, longitude]);

  const onMapLoad = (map: google.maps.Map) => {
    setMapInstance(map);
  };

  const onMapUnmount = () => {
    setMapInstance(null);
  };

  const resetMapSelectionFromManualAddressEdit = () => {
    setValue("google_place_id", "", { shouldDirty: true, shouldValidate: true });
    setValue("latitude", "", { shouldDirty: true, shouldValidate: true });
    setValue("longitude", "", { shouldDirty: true, shouldValidate: true });
    setValue("location", "", { shouldDirty: true, shouldValidate: true });
    setMapQuery("Delhi");
  };

  const parseAddressComponents = (components: any[], placeName?: string) => {
    let line1 = "";
    let line2 = "";
    let city = "";
    let state = "";
    let pincode = "";

    if (!components || !components.length) return { line1, line2, city, state, pincode };

    for (const component of components) {
      const types = component.types;
      if (types.includes("street_number")) {
        line1 = component.long_name;
      }
      if (types.includes("route")) {
        line1 = line1 ? `${line1} ${component.long_name}` : component.long_name;
      }
      if (types.includes("sublocality") || types.includes("neighborhood") || types.includes("sublocality_level_1") || types.includes("sublocality_level_2")) {
        line2 = line2 ? `${line2}, ${component.long_name}` : component.long_name;
      }
      if (types.includes("locality") || types.includes("postal_town")) {
        city = component.long_name;
      }
      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }
      if (types.includes("postal_code")) {
        pincode = component.long_name;
      }
    }

    if (!city) {
      const fallbackCity = components.find((c: any) => c.types.includes("administrative_area_level_2"));
      if (fallbackCity) city = fallbackCity.long_name;
    }
    
    if (!line1 && placeName) {
       line1 = placeName;
    }

    return { line1, line2, city, state, pincode };
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setValue("latitude", lat.toString(), { shouldDirty: true, shouldValidate: true });
    setValue("longitude", lng.toString(), { shouldDirty: true, shouldValidate: true });
    
    const maps = (globalThis as typeof globalThis & { google?: any }).google;
    if (!maps?.maps?.Geocoder) return;

    const geocoder = new maps.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
      if (status === "OK" && results?.[0]) {
        const place = results[0];
        setValue("google_place_id", place.place_id, { shouldDirty: true, shouldValidate: true });
        
        if (place.formatted_address) {
          setValue("location", place.formatted_address, { shouldDirty: true, shouldValidate: true });
          setMapQuery(place.formatted_address);
        }

        const { line1, line2, city, state, pincode } = parseAddressComponents(place.address_components);
        
        if (line1) setValue("line1", line1, { shouldDirty: true, shouldValidate: true });
        if (line2) setValue("line2", line2, { shouldDirty: true, shouldValidate: true });
        if (city) setValue("city", city, { shouldDirty: true, shouldValidate: true });
        if (state) setValue("state", state, { shouldDirty: true, shouldValidate: true });
        if (pincode) setValue("pincode", pincode, { shouldDirty: true, shouldValidate: true });
      }
    });

    if (mapInstance) {
      mapInstance.panTo({ lat, lng });
    }
  };

  const applyPlaceSelection = (place: any) => {
    const placeId = place?.place_id || "";
    const locationValue = place?.formatted_address || "";
    const maps = (globalThis as typeof globalThis & { google?: any }).google;

    if (!maps || !placeId) {
      setValue("google_place_id", "", { shouldDirty: true });
      setValue("latitude", "", { shouldDirty: true });
      setValue("longitude", "", { shouldDirty: true });
      return;
    }

    const placesService = new maps.maps.places.PlacesService(mapsRef.current || document.createElement("div"));
    placesService.getDetails(
      {
        placeId,
        fields: ["place_id", "formatted_address", "geometry.location", "address_components", "name"],
      },
      (details: any, detailsStatus: string) => {
        if (detailsStatus !== maps.maps.places.PlacesServiceStatus.OK || !details) {
          setValue("google_place_id", placeId, { shouldDirty: true });
          setValue("latitude", "", { shouldDirty: true });
          setValue("longitude", "", { shouldDirty: true });
          if (locationValue) {
            setValue("location", locationValue, { shouldDirty: true });
            setMapQuery(locationValue);
          }
          return;
        }

        const lat = details?.geometry?.location?.lat?.();
        const lng = details?.geometry?.location?.lng?.();
        const resolvedLocation = details?.formatted_address || locationValue;

        setValue("google_place_id", details?.place_id || placeId, { shouldDirty: true, shouldValidate: true });
        setValue("latitude", typeof lat === "number" ? String(lat) : "", { shouldDirty: true, shouldValidate: true });
        setValue("longitude", typeof lng === "number" ? String(lng) : "", { shouldDirty: true, shouldValidate: true });

        if (resolvedLocation) {
          setValue("location", resolvedLocation, { shouldDirty: true, shouldValidate: true });
          setMapQuery(resolvedLocation);
        }

        const { line1, line2, city, state, pincode } = parseAddressComponents(details?.address_components || [], details?.name);
        
        if (line1) setValue("line1", line1, { shouldDirty: true, shouldValidate: true });
        if (line2) setValue("line2", line2, { shouldDirty: true, shouldValidate: true });
        if (city) setValue("city", city, { shouldDirty: true, shouldValidate: true });
        if (state) setValue("state", state, { shouldDirty: true, shouldValidate: true });
        if (pincode) setValue("pincode", pincode, { shouldDirty: true, shouldValidate: true });

        if (typeof lat === "number" && typeof lng === "number" && mapInstance) {
          mapInstance.panTo({ lat, lng });
          mapInstance.setZoom(15);
        }
      }
    );
  };

  const handleLocationChange = (value: string) => {
    setValue("location", value, { shouldDirty: true, shouldValidate: true });
    setMapQuery(value || "Delhi");
    setValue("google_place_id", "", { shouldDirty: true, shouldValidate: true });
    setValue("latitude", "", { shouldDirty: true, shouldValidate: true });
    setValue("longitude", "", { shouldDirty: true, shouldValidate: true });
  };

  useEffect(() => {
    if (open && restaurant) {
      reset({
        name: restaurant.name || "",
        pincode: restaurant.pincode || "",
        state: restaurant.state || "",
        city: restaurant.city || "",
        line1: restaurant.line_one || "",
        line2: restaurant.line_two || "",
        status: restaurant.status?.toLowerCase() === "suspended" ? "suspended" : "active",
        location: restaurant.address || "",
        google_place_id: restaurant.google_place_id || "",
        latitude: restaurant.latitude?.toString() || "",
        longitude: restaurant.longitude?.toString() || "",
      });
      setMapQuery(restaurant.address || "Delhi");
    } else if (!open) {
      reset({
        name: "",
        pincode: "",
        state: "",
        city: "",
        line1: "",
        line2: "",
        status: "active",
        location: "",
        google_place_id: "",
        latitude: "",
        longitude: "",
      });
      setMapQuery("Delhi");
      setFocusedInput(null);
    }
  }, [open, restaurant, reset]);

  const onFormSubmit = async (data: RestaurantFormData) => {
    if (!loading) {
      onSubmit(data);
    }
  };

  const handleClose = () => {
    reset();
    setMapQuery("Delhi");
    setFocusedInput(null);
    onClose();
  };

  return (
    <FullPageModal
      open={open}
      onClose={handleClose}
      className="p-6"
    >
      <style>{`
        .pac-container {
          z-index: 99999 !important;
        }
      `}</style>
      <div className="flex flex-col h-full mx-auto pl-5 pr-12">
        <div>
          <Button
            type="button"
            variant="neutral"
            appearance="outlined"
            state="default"
            className="flex items-center text-[var(--color-neutral-secondary)] border border-[#E0E3E1] py-2 px-3 rounded-lg hover:text-[var(--color-neutral-secondary)] text-sm font-medium"
            onClick={handleClose}
          >
            
            <Icon name="arrow" className="w-5 h-5 mr-2 rotate-180 text-[#99A39D]" />
            <span className="text-[#99A39D]">GO BACK</span>
          </Button>
        </div>

        <hr className="border-t border-[#E0E3E1] my-6 w-full" />

        <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2 mt-8">
          Where&apos;s Your Business Operating?
        </h2>
        <p className="text-[var(--color-neutral-secondary)] text-lg font-normal">
          {isEditMode 
            ? "Update your restaurant details to manage your Grubpacs efficiently."
            : "Add your restaurant to start managing your Grubpacs efficiently."
          }
        </p>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col gap-8 mt-8 mx-auto"
        >
          <div className="grid grid-cols-2 gap-8 h-[48px]">
            <div className="space-y-6">
              <FormField
                name="name"
                label="Restaurant name"
                placeholder="Name your property"
                register={register}
                errors={errors}
                focusedInput={focusedInput}
                setFocusedInput={setFocusedInput}
                maxLength={100}
              />

              <div>
                <label className="block text-base text-[var(--color-neutral-secondary)] font-normal mb-4">
                  Add the address
                </label>
                <div className="flex gap-2 mb-4">
                  <FormField
                    name="pincode"
                    label=""
                    placeholder="Pincode"
                    register={register}
                    errors={errors}
                    focusedInput={focusedInput}
                    setFocusedInput={setFocusedInput}
                    width="w-1/3"
                    className="!h-10"
                    maxLength={6}
                    onChange={resetMapSelectionFromManualAddressEdit}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
                    }}
                  />
                  <FormField
                    name="state"
                    label=""
                    placeholder="State"
                    register={register}
                    errors={errors}
                    focusedInput={focusedInput}
                    setFocusedInput={setFocusedInput}
                    width="w-1/3"
                    className="!h-10"
                    maxLength={50}
                    onChange={resetMapSelectionFromManualAddressEdit}
                  />
                  <FormField
                    name="city"
                    label=""
                    placeholder="City"
                    register={register}
                    errors={errors}
                    focusedInput={focusedInput}
                    setFocusedInput={setFocusedInput}
                    width="w-1/3"
                    className="!h-10"
                    maxLength={50}
                    onChange={resetMapSelectionFromManualAddressEdit}
                  />
                </div>
                <FormField
                  name="line1"
                  label=""
                  placeholder="Line 1"
                  register={register}
                  errors={errors}
                  focusedInput={focusedInput}
                  setFocusedInput={setFocusedInput}
                  className="!h-10"
                  maxLength={255}
                  onChange={resetMapSelectionFromManualAddressEdit}
                />
                <div className="h-4"></div>
                <FormField
                  name="line2"
                  label=""
                  placeholder="Line 2"
                  register={register}
                  errors={errors}
                  focusedInput={focusedInput}
                  setFocusedInput={setFocusedInput}
                  className="!h-10"
                  maxLength={255}
                  onChange={resetMapSelectionFromManualAddressEdit}
                />
              </div>

              <div>
                <label className="block text-base text-[var(--color-neutral-secondary)] font-normal mb-4">
                  Status
                </label>
                <div className="flex text-lg gap-6 text-[var(--color-neutral-secondary)] mt-1">
                  <Radio
                    checked={status === "active"}
                    onChange={() => setValue("status", "active")}
                    label="Active"
                    name="status"
                    value="active"
                    variant="default"
                  />
                  <Radio
                    checked={status === "suspended"}
                    onChange={() => setValue("status", "suspended")}
                    label="Suspended"
                    name="status"
                    value="suspended"
                    variant="default"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-start gap-4">
              <div ref={mapsRef} className="hidden" aria-hidden="true" />
              <div 
                className="relative shadow-lg"
                style={{ width: '500px', height: '484px', borderRadius: '16px', overflow: 'hidden' }}
              >
                {isMapsLoaded ? (
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocompleteRef.current = autocomplete;
                    }}
                    onPlaceChanged={() => {
                      if (autocompleteRef.current) {
                        const place = autocompleteRef.current.getPlace();
                        applyPlaceSelection(place);
                      }
                    }}
                    options={{ fields: ["place_id", "formatted_address"] }}
                  >
                    <input
                      id="restaurant-location"
                      name="location"
                      ref={locationInputRef}
                      type="text"
                      placeholder="Add location"
                      className="absolute top-3 left-3 right-3 z-10 bg-white rounded-lg shadow-sm"
                      value={location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                        }
                      }}
                      disabled={!googleMapsApiKey || Boolean(mapsLoadError)}
                      style={{ 
                        display: 'flex',
                        height: '48px',
                        minWidth: '40px',
                        padding: '12px 16px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '12px',
                        alignSelf: 'stretch',
                        width: 'calc(100% - 24px)',
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px'
                      }}
                    />
                  </Autocomplete>
                ) : (
                  <input
                    id="restaurant-location"
                    name="location"
                    type="text"
                    placeholder="Loading Maps..."
                    className="absolute top-3 left-3 right-3 z-10 bg-white rounded-lg shadow-sm"
                    disabled={true}
                    style={{ 
                      display: 'flex',
                      height: '48px',
                      minWidth: '40px',
                      padding: '12px 16px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '12px',
                      alignSelf: 'stretch',
                      width: 'calc(100% - 24px)',
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                )}
                {isMapsLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={center}
                    zoom={latitude && longitude ? 15 : 13}
                    onLoad={onMapLoad}
                    onUnmount={onMapUnmount}
                    onClick={handleMapClick}
                    options={{
                      disableDefaultUI: false,
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {latitude && longitude && (
                      <MarkerF 
                        position={{ lat: Number(latitude), lng: Number(longitude) }} 
                        draggable={true}
                        onDragEnd={(e) => {
                          if (e.latLng) {
                            handleMapClick({ latLng: e.latLng } as google.maps.MapMouseEvent);
                          }
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <p className="text-[var(--color-neutral-secondary)]">Loading Map...</p>
                  </div>
                )}
              </div>
              {(!googleMapsApiKey || mapsLoadError) && (
                <p className="max-w-[500px] text-sm text-[var(--color-neutral-secondary)]">
                  Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable location search and place capture.
                </p>
              )}
              {errors.google_place_id ? (
                <p className="max-w-[500px] text-sm text-red-500">
                  {errors.google_place_id.message as string}
                </p>
              ) : null}
              {submitCount > 0 && Object.keys(errors).length > 0 ? (
                <p className="max-w-[500px] text-sm text-red-500">
                  Please complete all required fields.
                </p>
              ) : null}
              <div className="max-w-[500px] flex justify-end w-full">
                <Button
                  type="submit"
                  variant="primary"
                  appearance="solid"
                  state="press"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-medium duration-200 !text-base flex items-center gap-2 h-[40px] group"
                >
                  <FiCheck className="w-5 h-5" />
                  <span className="group-hover:underline uppercase">
                    {isEditMode ? "SAVE CHANGES" : "SAVE DETAILS"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </FullPageModal>
  );
}
