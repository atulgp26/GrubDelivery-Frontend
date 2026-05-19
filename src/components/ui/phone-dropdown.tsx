"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// Country data with flag emojis and dial codes
interface Country {
	name: string;
	code: string;
	dialCode: string;
	flag: string;
}

export const COUNTRIES: Country[] = [
	{ name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫" },
	{ name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱" },
	{ name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿" },
	{ name: "American Samoa", code: "AS", dialCode: "+1684", flag: "🇦🇸" },
	{ name: "Andorra", code: "AD", dialCode: "+376", flag: "🇦🇩" },
	{ name: "Angola", code: "AO", dialCode: "+244", flag: "🇦🇴" },
	{ name: "Anguilla", code: "AI", dialCode: "+1264", flag: "🇦🇮" },
	{ name: "Antigua and Barbuda", code: "AG", dialCode: "+1268", flag: "🇦🇬" },
	{ name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
	{ name: "Armenia", code: "AM", dialCode: "+374", flag: "🇦🇲" },
	{ name: "Aruba", code: "AW", dialCode: "+297", flag: "🇦🇼" },
	{ name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
	{ name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹" },
	{ name: "Azerbaijan", code: "AZ", dialCode: "+994", flag: "🇦🇿" },
	{ name: "Bahamas", code: "BS", dialCode: "+1242", flag: "🇧🇸" },
	{ name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭" },
	{ name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
	{ name: "Barbados", code: "BB", dialCode: "+1246", flag: "🇧🇧" },
	{ name: "Belarus", code: "BY", dialCode: "+375", flag: "🇧🇾" },
	{ name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪" },
	{ name: "Belize", code: "BZ", dialCode: "+501", flag: "🇧🇿" },
	{ name: "Benin", code: "BJ", dialCode: "+229", flag: "🇧🇯" },
	{ name: "Bermuda", code: "BM", dialCode: "+1441", flag: "🇧🇲" },
	{ name: "Bhutan", code: "BT", dialCode: "+975", flag: "🇧🇹" },
	{ name: "Bolivia", code: "BO", dialCode: "+591", flag: "🇧🇴" },
	{ name: "Bosnia and Herzegovina", code: "BA", dialCode: "+387", flag: "🇧🇦" },
	{ name: "Botswana", code: "BW", dialCode: "+267", flag: "🇧🇼" },
	{ name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
	{ name: "British Indian Ocean Territory", code: "IO", dialCode: "+246", flag: "🇮🇴" },
	{ name: "Brunei", code: "BN", dialCode: "+673", flag: "🇧🇳" },
	{ name: "Bulgaria", code: "BG", dialCode: "+359", flag: "🇧🇬" },
	{ name: "Burkina Faso", code: "BF", dialCode: "+226", flag: "🇧🇫" },
	{ name: "Burundi", code: "BI", dialCode: "+257", flag: "🇧🇮" },
	{ name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭" },
	{ name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲" },
	{ name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
	{ name: "Cape Verde", code: "CV", dialCode: "+238", flag: "🇨🇻" },
	{ name: "Cayman Islands", code: "KY", dialCode: "+1345", flag: "🇰🇾" },
	{ name: "Central African Republic", code: "CF", dialCode: "+236", flag: "🇨🇫" },
	{ name: "Chad", code: "TD", dialCode: "+235", flag: "🇹🇩" },
	{ name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱" },
	{ name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
	{ name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴" },
	{ name: "Comoros", code: "KM", dialCode: "+269", flag: "🇰🇲" },
	{ name: "Congo", code: "CG", dialCode: "+242", flag: "🇨🇬" },
	{ name: "Congo (DRC)", code: "CD", dialCode: "+243", flag: "🇨🇩" },
	{ name: "Cook Islands", code: "CK", dialCode: "+682", flag: "🇨🇰" },
	{ name: "Costa Rica", code: "CR", dialCode: "+506", flag: "🇨🇷" },
	{ name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷" },
	{ name: "Cuba", code: "CU", dialCode: "+53", flag: "🇨🇺" },
	{ name: "Curacao", code: "CW", dialCode: "+599", flag: "🇨🇼" },
	{ name: "Cyprus", code: "CY", dialCode: "+357", flag: "🇨🇾" },
	{ name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿" },
	{ name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰" },
	{ name: "Djibouti", code: "DJ", dialCode: "+253", flag: "🇩🇯" },
	{ name: "Dominica", code: "DM", dialCode: "+1767", flag: "🇩🇲" },
	{ name: "Dominican Republic", code: "DO", dialCode: "+1849", flag: "🇩🇴" },
	{ name: "Ecuador", code: "EC", dialCode: "+593", flag: "🇪🇨" },
	{ name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
	{ name: "El Salvador", code: "SV", dialCode: "+503", flag: "🇸🇻" },
	{ name: "Equatorial Guinea", code: "GQ", dialCode: "+240", flag: "🇬🇶" },
	{ name: "Eritrea", code: "ER", dialCode: "+291", flag: "🇪🇷" },
	{ name: "Estonia", code: "EE", dialCode: "+372", flag: "🇪🇪" },
	{ name: "Eswatini", code: "SZ", dialCode: "+268", flag: "🇸🇿" },
	{ name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹" },
	{ name: "Falkland Islands", code: "FK", dialCode: "+500", flag: "🇫🇰" },
	{ name: "Faroe Islands", code: "FO", dialCode: "+298", flag: "🇫🇴" },
	{ name: "Fiji", code: "FJ", dialCode: "+679", flag: "🇫🇯" },
	{ name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮" },
	{ name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
	{ name: "French Guiana", code: "GF", dialCode: "+594", flag: "🇬🇫" },
	{ name: "French Polynesia", code: "PF", dialCode: "+689", flag: "🇵🇫" },
	{ name: "Gabon", code: "GA", dialCode: "+241", flag: "🇬🇦" },
	{ name: "Gambia", code: "GM", dialCode: "+220", flag: "🇬🇲" },
	{ name: "Georgia", code: "GE", dialCode: "+995", flag: "🇬🇪" },
	{ name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
	{ name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
	{ name: "Gibraltar", code: "GI", dialCode: "+350", flag: "🇬🇮" },
	{ name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷" },
	{ name: "Greenland", code: "GL", dialCode: "+299", flag: "🇬🇱" },
	{ name: "Grenada", code: "GD", dialCode: "+1473", flag: "🇬🇩" },
	{ name: "Guadeloupe", code: "GP", dialCode: "+590", flag: "🇬🇵" },
	{ name: "Guam", code: "GU", dialCode: "+1671", flag: "🇬🇺" },
	{ name: "Guatemala", code: "GT", dialCode: "+502", flag: "🇬🇹" },
	{ name: "Guernsey", code: "GG", dialCode: "+44", flag: "🇬🇬" },
	{ name: "Guinea", code: "GN", dialCode: "+224", flag: "🇬🇳" },
	{ name: "Guinea-Bissau", code: "GW", dialCode: "+245", flag: "🇬🇼" },
	{ name: "Guyana", code: "GY", dialCode: "+592", flag: "🇬🇾" },
	{ name: "Haiti", code: "HT", dialCode: "+509", flag: "🇭🇹" },
	{ name: "Honduras", code: "HN", dialCode: "+504", flag: "🇭🇳" },
	{ name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰" },
	{ name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺" },
	{ name: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸" },
	{ name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
	{ name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
	{ name: "Iran", code: "IR", dialCode: "+98", flag: "🇮🇷" },
	{ name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶" },
	{ name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
	{ name: "Isle of Man", code: "IM", dialCode: "+44", flag: "🇮🇲" },
	{ name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱" },
	{ name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
	{ name: "Ivory Coast", code: "CI", dialCode: "+225", flag: "🇨🇮" },
	{ name: "Jamaica", code: "JM", dialCode: "+1876", flag: "🇯🇲" },
	{ name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
	{ name: "Jersey", code: "JE", dialCode: "+44", flag: "🇯🇪" },
	{ name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴" },
	{ name: "Kazakhstan", code: "KZ", dialCode: "+7", flag: "🇰🇿" },
	{ name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
	{ name: "Kiribati", code: "KI", dialCode: "+686", flag: "🇰🇮" },
	{ name: "Kosovo", code: "XK", dialCode: "+383", flag: "🇽🇰" },
	{ name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼" },
	{ name: "Kyrgyzstan", code: "KG", dialCode: "+996", flag: "🇰🇬" },
	{ name: "Laos", code: "LA", dialCode: "+856", flag: "🇱🇦" },
	{ name: "Latvia", code: "LV", dialCode: "+371", flag: "🇱🇻" },
	{ name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧" },
	{ name: "Lesotho", code: "LS", dialCode: "+266", flag: "🇱🇸" },
	{ name: "Liberia", code: "LR", dialCode: "+231", flag: "🇱🇷" },
	{ name: "Libya", code: "LY", dialCode: "+218", flag: "🇱🇾" },
	{ name: "Liechtenstein", code: "LI", dialCode: "+423", flag: "🇱🇮" },
	{ name: "Lithuania", code: "LT", dialCode: "+370", flag: "🇱🇹" },
	{ name: "Luxembourg", code: "LU", dialCode: "+352", flag: "🇱🇺" },
	{ name: "Macao", code: "MO", dialCode: "+853", flag: "🇲🇴" },
	{ name: "Madagascar", code: "MG", dialCode: "+261", flag: "🇲🇬" },
	{ name: "Malawi", code: "MW", dialCode: "+265", flag: "🇲🇼" },
	{ name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
	{ name: "Maldives", code: "MV", dialCode: "+960", flag: "🇲🇻" },
	{ name: "Mali", code: "ML", dialCode: "+223", flag: "🇲🇱" },
	{ name: "Malta", code: "MT", dialCode: "+356", flag: "🇲🇹" },
	{ name: "Marshall Islands", code: "MH", dialCode: "+692", flag: "🇲🇭" },
	{ name: "Martinique", code: "MQ", dialCode: "+596", flag: "🇲🇶" },
	{ name: "Mauritania", code: "MR", dialCode: "+222", flag: "🇲🇷" },
	{ name: "Mauritius", code: "MU", dialCode: "+230", flag: "🇲🇺" },
	{ name: "Mayotte", code: "YT", dialCode: "+262", flag: "🇾🇹" },
	{ name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
	{ name: "Micronesia", code: "FM", dialCode: "+691", flag: "🇫🇲" },
	{ name: "Moldova", code: "MD", dialCode: "+373", flag: "🇲🇩" },
	{ name: "Monaco", code: "MC", dialCode: "+377", flag: "🇲🇨" },
	{ name: "Mongolia", code: "MN", dialCode: "+976", flag: "🇲🇳" },
	{ name: "Montenegro", code: "ME", dialCode: "+382", flag: "🇲🇪" },
	{ name: "Montserrat", code: "MS", dialCode: "+1664", flag: "🇲🇸" },
	{ name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦" },
	{ name: "Mozambique", code: "MZ", dialCode: "+258", flag: "🇲🇿" },
	{ name: "Myanmar", code: "MM", dialCode: "+95", flag: "🇲🇲" },
	{ name: "Namibia", code: "NA", dialCode: "+264", flag: "🇳🇦" },
	{ name: "Nauru", code: "NR", dialCode: "+674", flag: "🇳🇷" },
	{ name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵" },
	{ name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
	{ name: "New Caledonia", code: "NC", dialCode: "+687", flag: "🇳🇨" },
	{ name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
	{ name: "Nicaragua", code: "NI", dialCode: "+505", flag: "🇳🇮" },
	{ name: "Niger", code: "NE", dialCode: "+227", flag: "🇳🇪" },
	{ name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
	{ name: "Niue", code: "NU", dialCode: "+683", flag: "🇳🇺" },
	{ name: "Norfolk Island", code: "NF", dialCode: "+672", flag: "🇳🇫" },
	{ name: "North Korea", code: "KP", dialCode: "+850", flag: "🇰🇵" },
	{ name: "North Macedonia", code: "MK", dialCode: "+389", flag: "🇲🇰" },
	{ name: "Northern Mariana Islands", code: "MP", dialCode: "+1670", flag: "🇲🇵" },
	{ name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
	{ name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲" },
	{ name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
	{ name: "Palau", code: "PW", dialCode: "+680", flag: "🇵🇼" },
	{ name: "Palestine", code: "PS", dialCode: "+970", flag: "🇵🇸" },
	{ name: "Panama", code: "PA", dialCode: "+507", flag: "🇵🇦" },
	{ name: "Papua New Guinea", code: "PG", dialCode: "+675", flag: "🇵🇬" },
	{ name: "Paraguay", code: "PY", dialCode: "+595", flag: "🇵🇾" },
	{ name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪" },
	{ name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
	{ name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱" },
	{ name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
	{ name: "Puerto Rico", code: "PR", dialCode: "+1939", flag: "🇵🇷" },
	{ name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
	{ name: "Reunion", code: "RE", dialCode: "+262", flag: "🇷🇪" },
	{ name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴" },
	{ name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺" },
	{ name: "Rwanda", code: "RW", dialCode: "+250", flag: "🇷🇼" },
	{ name: "Saint Barthelemy", code: "BL", dialCode: "+590", flag: "🇧🇱" },
	{ name: "Saint Helena", code: "SH", dialCode: "+290", flag: "🇸🇭" },
	{ name: "Saint Kitts and Nevis", code: "KN", dialCode: "+1869", flag: "🇰🇳" },
	{ name: "Saint Lucia", code: "LC", dialCode: "+1758", flag: "🇱🇨" },
	{ name: "Saint Martin", code: "MF", dialCode: "+590", flag: "🇲🇫" },
	{ name: "Saint Pierre and Miquelon", code: "PM", dialCode: "+508", flag: "🇵🇲" },
	{ name: "Saint Vincent and the Grenadines", code: "VC", dialCode: "+1784", flag: "🇻🇨" },
	{ name: "Samoa", code: "WS", dialCode: "+685", flag: "🇼🇸" },
	{ name: "San Marino", code: "SM", dialCode: "+378", flag: "🇸🇲" },
	{ name: "Sao Tome and Principe", code: "ST", dialCode: "+239", flag: "🇸🇹" },
	{ name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
	{ name: "Senegal", code: "SN", dialCode: "+221", flag: "🇸🇳" },
	{ name: "Serbia", code: "RS", dialCode: "+381", flag: "🇷🇸" },
	{ name: "Seychelles", code: "SC", dialCode: "+248", flag: "🇸🇨" },
	{ name: "Sierra Leone", code: "SL", dialCode: "+232", flag: "🇸🇱" },
	{ name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
	{ name: "Sint Maarten", code: "SX", dialCode: "+1721", flag: "🇸🇽" },
	{ name: "Slovakia", code: "SK", dialCode: "+421", flag: "🇸🇰" },
	{ name: "Slovenia", code: "SI", dialCode: "+386", flag: "🇸🇮" },
	{ name: "Solomon Islands", code: "SB", dialCode: "+677", flag: "🇸🇧" },
	{ name: "Somalia", code: "SO", dialCode: "+252", flag: "🇸🇴" },
	{ name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
	{ name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
	{ name: "South Sudan", code: "SS", dialCode: "+211", flag: "🇸🇸" },
	{ name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
	{ name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰" },
	{ name: "Sudan", code: "SD", dialCode: "+249", flag: "🇸🇩" },
	{ name: "Suriname", code: "SR", dialCode: "+597", flag: "🇸🇷" },
	{ name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
	{ name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
	{ name: "Syria", code: "SY", dialCode: "+963", flag: "🇸🇾" },
	{ name: "Taiwan", code: "TW", dialCode: "+886", flag: "🇹🇼" },
	{ name: "Tajikistan", code: "TJ", dialCode: "+992", flag: "🇹🇯" },
	{ name: "Tanzania", code: "TZ", dialCode: "+255", flag: "🇹🇿" },
	{ name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
	{ name: "Timor-Leste", code: "TL", dialCode: "+670", flag: "🇹🇱" },
	{ name: "Togo", code: "TG", dialCode: "+228", flag: "🇹🇬" },
	{ name: "Tokelau", code: "TK", dialCode: "+690", flag: "🇹🇰" },
	{ name: "Tonga", code: "TO", dialCode: "+676", flag: "🇹🇴" },
	{ name: "Trinidad and Tobago", code: "TT", dialCode: "+1868", flag: "🇹🇹" },
	{ name: "Tunisia", code: "TN", dialCode: "+216", flag: "🇹🇳" },
	{ name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
	{ name: "Turkmenistan", code: "TM", dialCode: "+993", flag: "🇹🇲" },
	{ name: "Turks and Caicos Islands", code: "TC", dialCode: "+1649", flag: "🇹🇨" },
	{ name: "Tuvalu", code: "TV", dialCode: "+688", flag: "🇹🇻" },
	{ name: "Uganda", code: "UG", dialCode: "+256", flag: "🇺🇬" },
	{ name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦" },
	{ name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
	{ name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
	{ name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
	{ name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾" },
	{ name: "Uzbekistan", code: "UZ", dialCode: "+998", flag: "🇺🇿" },
	{ name: "Vanuatu", code: "VU", dialCode: "+678", flag: "🇻🇺" },
	{ name: "Vatican City", code: "VA", dialCode: "+379", flag: "🇻🇦" },
	{ name: "Venezuela", code: "VE", dialCode: "+58", flag: "🇻🇪" },
	{ name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
	{ name: "Virgin Islands (British)", code: "VG", dialCode: "+1284", flag: "🇻🇬" },
	{ name: "Virgin Islands (U.S.)", code: "VI", dialCode: "+1340", flag: "🇻🇮" },
	{ name: "Wallis and Futuna", code: "WF", dialCode: "+681", flag: "🇼🇫" },
	{ name: "Yemen", code: "YE", dialCode: "+967", flag: "🇾🇪" },
	{ name: "Zambia", code: "ZM", dialCode: "+260", flag: "🇿🇲" },
	{ name: "Zimbabwe", code: "ZW", dialCode: "+263", flag: "🇿🇼" },
];

export interface PhoneDropdownProps {
	value?: string;
	phoneNumber?: string;
	onCountryChange?: (country: Country) => void;
	onPhoneNumberChange?: (value: string) => void;
	leadingIcon?: React.ReactNode;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	width?: number | string;
}

const PhoneDropdown = React.forwardRef<HTMLDivElement, PhoneDropdownProps>(
	(
		{
			value = "IN",
			phoneNumber = "",
			onCountryChange,
			onPhoneNumberChange,
			leadingIcon,
			placeholder = "00000 00000",
			disabled = false,
			className,
			width = 300,
		},
		ref
	) => {
		const [isOpen, setIsOpen] = React.useState(false);
		const [searchQuery, setSearchQuery] = React.useState("");
		const [isFocused, setIsFocused] = React.useState(false);
		const [flagImageLoadFailures, setFlagImageLoadFailures] = React.useState<
			Set<string>
		>(new Set());
		const containerRef = React.useRef<HTMLDivElement>(null);
		const searchInputRef = React.useRef<HTMLInputElement>(null);
		const dropdownRef = React.useRef<HTMLDivElement>(null);

		const selectedCountry = React.useMemo(
			() => COUNTRIES.find((c) => c.code === value) || COUNTRIES[1],
			[value]
		);

		const filteredCountries = React.useMemo(() => {
			if (!searchQuery.trim()) return COUNTRIES;
			const query = searchQuery.toLowerCase();
			return COUNTRIES.filter(
				(c) =>
					c.name.toLowerCase().includes(query) ||
					c.dialCode.includes(query) ||
					c.code.toLowerCase().includes(query)
			);
		}, [searchQuery]);

		// Close dropdown on click outside
		React.useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					containerRef.current &&
					!containerRef.current.contains(event.target as Node)
				) {
					setIsOpen(false);
					setSearchQuery("");
				}
			};
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		React.useEffect(() => {
			if (isOpen && searchInputRef.current) {
				searchInputRef.current.focus();
			}
		}, [isOpen]);

		const handleCountrySelect = (country: Country) => {
			onCountryChange?.(country);
			setIsOpen(false);
			setSearchQuery("");
		};

		const getFlagImageSrc = (countryCode: string) => {
			return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
		};

		const handleToggleDropdown = () => {
			if (!disabled) {
				setIsOpen((prev) => !prev);
				if (isOpen) setSearchQuery("");
			}
		};

		const formatPhoneDisplay = (value: string) => {
			const digits = value.replace(/\D/g, "");
			if (digits.length <= 5) return digits;
			return `${digits.slice(0, 5)} ${digits.slice(5)}`;
		};

		const handlePhoneChange = (nextValue: string) => {
			const digitsOnly = nextValue.replace(/\D/g, "");
			onPhoneNumberChange?.(digitsOnly);
		};

		return (
			<div
				ref={containerRef}
				className={cn("relative inline-flex flex-col", className)}
				style={{ width: typeof width === "number" ? `${width}px` : width }}
			>
				{/* Phone Input Field */}
				<div
					ref={ref}
					className={cn(
						"flex items-center gap-[12px] rounded-[8px] border bg-white transition-colors",
						"px-[16px] py-[12px]",
						"h-[48px]",
						isFocused
							? "border-[var(--gp-color-brand-primary)] ring-2 ring-[rgb(var(--neutral-300))]"
							: "border-[#e0e3e1] hover:border-[var(--gp-color-brand-primary)]",
						disabled && "opacity-50 cursor-not-allowed"
					)}
				>
					{leadingIcon && (
						<div className="shrink-0 size-[24px] flex items-center justify-center text-[var(--gp-color-text-neutral-light)]">
							{leadingIcon}
						</div>
					)}

					{/* Country Code Button */}
					<Button
						type="button"
						onClick={handleToggleDropdown}
						disabled={disabled}
						variant="neutral"
						appearance="ghost"
						size="sm"
						className="group shrink-0 border-[#e0e3e1] text-[#37493f] hover:bg-[#EFF1F0] hover:border-[#e0e3e1] bg-transparent"
					>
						<span
							className="shrink-0 group-hover:underline underline-offset-2"
							style={{
								fontFamily: "var(--gp-font-interactive)",
								fontWeight: 500,
								fontSize: "14px",
								lineHeight: "16px",
								fontFeatureSettings: "'frac' 1",
							}}
						>
							{selectedCountry.dialCode}
						</span>
						{/* Chevron Down Icon */}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="shrink-0"
						>
							<path
								d="M6 9L12 15L18 9"
								stroke="#6b7971"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</Button>

					{/* Vertical Divider Line */}
					<div
						className="shrink-0 self-stretch"
						style={{
							width: "1px",
							backgroundColor: "#e0e3e1",
						}}
					/>

					{/* Phone Number Input */}
					<input
						type="tel"
						value={formatPhoneDisplay(phoneNumber)}
						onChange={(e) => handlePhoneChange(e.target.value)}
						placeholder={placeholder}
						disabled={disabled}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						className="flex-1 min-w-0 bg-transparent outline-none border-none overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-[24px] text-[#37493f] placeholder:text-[var(--gp-color-text-neutral-light)]"
						style={{
							fontFamily: "var(--gp-font-text)",
							fontWeight: 400,
							fontFeatureSettings: "'frac' 1",
						}}
					/>
				</div>

				{/* Dropdown Panel */}
				{isOpen && (
					<div
						ref={dropdownRef}
						className="absolute top-[56px] left-0 z-50 flex flex-col items-start rounded-[var(--gp-radius-base)] border border-[var(--gp-color-border-neutral)] bg-[var(--gp-color-bg-white)]"
						style={{
							width: typeof width === "number" ? `${width}px` : width,
							height: "264px",
							boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.1), 4px 4px 8px 0px rgba(0, 0, 0, 0.12)",
							overflow: "clip",
						}}
					>
						{/* Search Field */}
						<div className="flex flex-col items-start px-[12px] py-[8px] shrink-0 w-full">
							<div
								className="flex items-center gap-[8px] h-[32px] w-full bg-white border border-[var(--gp-color-border-neutral)] rounded-[var(--gp-radius-base)] px-[12px] py-[8px] cursor-pointer min-w-[40px]"
								style={{ overflow: "clip" }}
							>
								{/* Search Icon */}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="shrink-0 size-[24px]"
									style={{ overflow: "clip" }}
								>
									<path
										d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
										stroke="#a4aca7"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M21 21L16.65 16.65"
										stroke="#a4aca7"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								{/* Search Input */}
								<input
									ref={searchInputRef}
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search"
									className="flex-1 min-w-0 min-h-px bg-transparent outline-none border-none text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] placeholder:text-[var(--gp-color-text-neutral-light)]"
									style={{
										fontFamily: "var(--gp-font-text)",
										fontWeight: 400,
										fontFeatureSettings: "'frac' 1",
									}}
								/>
							</div>
						</div>

						{/* Country List */}
						<div
							className="flex flex-col flex-1 items-start min-h-0 min-w-0 w-full"
							style={{ overflowX: "clip", overflowY: "auto" }}
						>
							{filteredCountries.map((country, index) => {
								const isSelected = country.code === selectedCountry.code;
								return (
									<button
										key={`${country.code}-${index}`}
										type="button"
										onClick={() => handleCountrySelect(country)}
										className={cn(
											"group flex items-center gap-[12px] w-full shrink-0",
											"px-[12px] py-[8px]",
											"border-t border-[var(--gp-color-border-neutral)] border-solid",
											"bg-white",
											"cursor-pointer text-left transition-colors",
											"hover:bg-[#FFD9CC]",
											isSelected && "!bg-[#FFD9CC] hover:!bg-[#FFD9CC]"
										)}
										style={{ overflow: "clip" }}
									>
										{/* Flag */}
										<span className="shrink-0 size-[16px] flex items-center justify-center">
											{flagImageLoadFailures.has(country.code) ? (
												<span style={{ fontSize: "10px", lineHeight: 1 }}>
													{country.flag}
												</span>
											) : (
												<img
													src={getFlagImageSrc(country.code)}
													alt={`${country.name} flag`}
													width={16}
													height={12}
													className="rounded-[2px] object-cover"
													loading="lazy"
													decoding="async"
													onError={() => {
														setFlagImageLoadFailures((prev) => {
															if (prev.has(country.code)) return prev;
															const next = new Set(prev);
															next.add(country.code);
															return next;
														});
													}}
												/>
											)}
										</span>

										{/* Country Name with Dial Code */}
										<div className="flex flex-1 flex-col gap-[4px] items-start min-h-px min-w-0">
											<span
												className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)]"
												style={{
													fontFamily: "var(--gp-font-text)",
													fontWeight: 400,
													fontFeatureSettings: "'frac' 1",
												}}
											>
												{country.name} {"("}
												<span className="group-hover:underline underline-offset-2 decoration-current">
													{country.dialCode}
												</span>
												{")"}
											</span>
										</div>
									</button>
								);
							})}
							{filteredCountries.length === 0 && (
								<div className="flex items-center justify-center w-full py-[12px]">
									<span
										className="text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-light)]"
										style={{
											fontFamily: "var(--gp-font-text)",
											fontWeight: 400,
										}}
									>
										No countries found
									</span>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);
	}
);

PhoneDropdown.displayName = "PhoneDropdown";

export { PhoneDropdown, type Country };
