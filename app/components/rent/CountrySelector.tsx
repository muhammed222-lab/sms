// components/rent/CountrySelector.tsx
import React from "react";
import Select from "react-select";

interface CountrySelectorProps {
  selectedCountry: string;
  setSelectedCountry: (value: string) => void;
  setCurrentStep: (step: number) => void;
  disabled?: boolean;
}

const countries = [
  { display: "Afghanistan", code: "afghanistan" },
  { display: "Afghanistan", code: "afghanistan" },
  { display: "Albania", code: "albania" },
  { display: "Venezuela", code: "venezuela" },
  { display: "Vietnam", code: "vietnam" },
  { display: "Zambia", code: "zambia" },
  { display: "Algeria", code: "algeria" },
  { display: "Angola", code: "angola" },
  { display: "Antigua and Barbuda", code: "antiguaandbarbuda" },
  { display: "Argentina", code: "argentina" },
  { display: "Armenia", code: "armenia" },
  { display: "Aruba", code: "aruba" },
  { display: "Australia", code: "australia" },
  { display: "Austria", code: "austria" },
  { display: "Azerbaijan", code: "azerbaijan" },
  { display: "Bahamas", code: "bahamas" },
  { display: "Bahrain", code: "bahrain" },
  { display: "Bangladesh", code: "bangladesh" },
  { display: "Barbados", code: "barbados" },
  { display: "Belarus", code: "belarus" },
  { display: "Belgium", code: "belgium" },
  { display: "Belize", code: "belize" },
  { display: "Benin", code: "benin" },
  { display: "Bhutan", code: "bhutane" },
  { display: "Bosnia and Herzegovina", code: "bih" },
  { display: "Bolivia", code: "bolivia" },
  { display: "Botswana", code: "botswana" },
  { display: "Brazil", code: "brazil" },
  { display: "Bulgaria", code: "bulgaria" },
  { display: "Burkina Faso", code: "burkinafaso" },
  { display: "Burundi", code: "burundi" },
  { display: "Cambodia", code: "cambodia" },
  { display: "Cameroon", code: "cameroon" },
  { display: "Canada", code: "canada" },
  { display: "Cape Verde", code: "capeverde" },
  { display: "Chad", code: "chad" },
  { display: "Chile", code: "chile" },
  { display: "Colombia", code: "colombia" },
  { display: "Comoros", code: "comoros" },
  { display: "Congo", code: "congo" },
  { display: "Costa Rica", code: "costarica" },
  { display: "Croatia", code: "croatia" },
  { display: "Cyprus", code: "cyprus" },
  { display: "Czechia", code: "czech" },
  { display: "Denmark", code: "denmark" },
  { display: "Dominican Republic", code: "dominicana" },
  { display: "East Timor", code: "easttimor" },
  { display: "Ecuador", code: "ecuador" },
  { display: "Egypt", code: "egypt" },
  { display: "England", code: "england" },
  { display: "Equatorial Guinea", code: "equatorialguinea" },
  { display: "Estonia", code: "estonia" },
  { display: "Ethiopia", code: "ethiopia" },
  { display: "Finland", code: "finland" },
  { display: "France", code: "france" },
  { display: "French Guiana", code: "frenchguiana" },
  { display: "Gabon", code: "gabon" },
  { display: "Gambia", code: "gambia" },
  { display: "Georgia", code: "georgia" },
  { display: "Germany", code: "germany" },
  { display: "Ghana", code: "ghana" },
  { display: "Gibraltar", code: "gibraltar" },
  { display: "Greece", code: "greece" },
  { display: "Guadeloupe", code: "guadeloupe" },
  { display: "Guatemala", code: "guatemala" },
  { display: "Guinea-Bissau", code: "guineabissau" },
  { display: "Guyana", code: "guyana" },
  { display: "Haiti", code: "haiti" },
  { display: "Honduras", code: "honduras" },
  { display: "Hong Kong", code: "hongkong" },
  { display: "Hungary", code: "hungary" },
  { display: "India", code: "india" },
  { display: "Indonesia", code: "indonesia" },
  { display: "Ireland", code: "ireland" },
  { display: "Israel", code: "israel" },
  { display: "Italy", code: "italy" },
  { display: "Ivory Coast", code: "ivorycoast" },
  { display: "Jamaica", code: "jamaica" },
  { display: "Jordan", code: "jordan" },
  { display: "Kazakhstan", code: "kazakhstan" },
  { display: "Kenya", code: "kenya" },
  { display: "Kuwait", code: "kuwait" },
  { display: "Kyrgyzstan", code: "kyrgyzstan" },
  { display: "Laos", code: "laos" },
  { display: "Latvia", code: "latvia" },
  { display: "Lesotho", code: "lesotho" },
  { display: "Liberia", code: "liberia" },
  { display: "Lithuania", code: "lithuania" },
  { display: "Luxembourg", code: "luxembourg" },
  { display: "Macau", code: "macau" },
  { display: "Madagascar", code: "madagascar" },
  { display: "Malawi", code: "malawi" },
  { display: "Malaysia", code: "malaysia" },
  { display: "Maldives", code: "maldives" },
  { display: "Mauritania", code: "mauritania" },
  { display: "Mauritius", code: "mauritius" },
  { display: "Mexico", code: "mexico" },
  { display: "Moldova", code: "moldova" },
  { display: "Mongolia", code: "mongolia" },
  { display: "Morocco", code: "morocco" },
  { display: "Mozambique", code: "mozambique" },
  { display: "Namibia", code: "namibia" },
  { display: "Nepal", code: "nepal" },
  { display: "Netherlands", code: "netherlands" },
  { display: "New Caledonia", code: "newcaledonia" },
  { display: "New Zealand", code: "newzealand" },
  { display: "Nicaragua", code: "nicaragua" },
  { display: "Nigeria", code: "nigeria" },
  { display: "North Macedonia", code: "northmacedonia" },
  { display: "Norway", code: "norway" },
  { display: "Oman", code: "oman" },
  { display: "Pakistan", code: "pakistan" },
  { display: "Panama", code: "panama" },
  { display: "Papua New Guinea", code: "papuanewguinea" },
  { display: "Paraguay", code: "paraguay" },
  { display: "Peru", code: "peru" },
  { display: "Philippines", code: "philippines" },
  { display: "Poland", code: "poland" },
  { display: "Portugal", code: "portugal" },
  { display: "Puertorico", code: "puertorico" },
  { display: "Reunion", code: "reunion" },
  { display: "Romania", code: "romania" },
  { display: "Russia", code: "russia" },
  { display: "Rwanda", code: "rwanda" },
  { display: "Saint Kitts and Nevis", code: "saintkittsandnevis" },
  { display: "Saint Lucia", code: "saintlucia" },
  {
    display: "Saint Vincent and the Grenadines",
    code: "saintvincentandgrenadines",
  },
  { display: "Salvador", code: "salvador" },
  { display: "Samoa", code: "samoa" },
  { display: "Saudi Arabia", code: "saudiarabia" },
  { display: "Senegal", code: "senegal" },
  { display: "Serbia", code: "serbia" },
  { display: "Republic of Seychelles", code: "seychelles" },
  { display: "Sierra Leone", code: "sierraleone" },
  { display: "Singapore", code: "singapore" },
  { display: "Slovakia", code: "slovakia" },
  { display: "Slovenia", code: "slovenia" },
  { display: "Solomon Islands", code: "solomonislands" },
  { display: "South Africa", code: "southafrica" },
  { display: "Spain", code: "spain" },
  { display: "Sri Lanka", code: "srilanka" },
  { display: "Suriname", code: "suriname" },
  { display: "Swaziland", code: "swaziland" },
  { display: "Sweden", code: "sweden" },
  { display: "Switzerland", code: "switzerland" },
  { display: "Taiwan", code: "taiwan" },
  { display: "Tajikistan", code: "tajikistan" },
  { display: "Tanzania", code: "tanzania" },
  { display: "Thailand", code: "thailand" },
  { display: "Trinidad and Tobago", code: "tit" },
  { display: "Togo", code: "togo" },
  { display: "Tunisia", code: "tunisia" },
  { display: "Turkmenistan", code: "turkmenistan" },
  { display: "Uganda", code: "uganda" },
  { display: "Ukraine", code: "ukraine" },
  { display: "Uruguay", code: "uruguay" },
  { display: "USA", code: "usa" },
  { display: "Uzbekistan", code: "uzbekistan" },
];

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  setSelectedCountry,
  setCurrentStep,
  disabled,
}) => {
  return (
    <div>
      <label className="block font-medium mb-2">Country</label>
      <Select
        options={countries.map((country) => ({
          value: country.code,
          label: country.display,
        }))}
        value={{
          value: selectedCountry,
          label:
            countries.find((c) => c.code === selectedCountry)?.display ||
            "Select Country",
        }}
        onChange={(selectedOption) => {
          if (selectedOption) {
            setSelectedCountry(selectedOption.value);
            setCurrentStep(2); // Move to next step
          }
        }}
        className="react-select-container"
        classNamePrefix="react-select"
        isDisabled={disabled}
        placeholder="Select country..."
      />
    </div>
  );
};

export default CountrySelector;
