// components/rent/OperatorSelector.tsx
import React from "react";
import Select from "react-select";

interface OperatorSelectorProps {
  selectedOperator: string;
  setSelectedOperator: (value: string) => void;
  setCurrentStep: (step: number) => void;
  disabled?: boolean;
}

const operators = ["any", "beeline", "tele2", "mts"];

const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  selectedOperator,
  setSelectedOperator,
  setCurrentStep,
  disabled,
}) => {
  return (
    <div>
      <label className="block font-medium mb-2">Operator</label>
      <Select
        options={operators.map((operator) => ({
          value: operator,
          label: operator.charAt(0).toUpperCase() + operator.slice(1),
        }))}
        value={{
          value: selectedOperator,
          label:
            selectedOperator.charAt(0).toUpperCase() +
            selectedOperator.slice(1),
        }}
        onChange={(selectedOption) => {
          if (selectedOption) {
            setSelectedOperator(selectedOption.value);
            setCurrentStep(3); // Move to next step
          }
        }}
        className="react-select-container"
        classNamePrefix="react-select"
        isDisabled={disabled}
        placeholder="Select operator..."
      />
    </div>
  );
};

export default OperatorSelector;
