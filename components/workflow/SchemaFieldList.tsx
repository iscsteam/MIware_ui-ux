// // src/components/workflow/SchemaFieldList.tsx (or similar path)
import React, { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { SchemaItem } from "@/components/workflow/SchemaModal";

interface SchemaFieldListProps {
  type: "input" | "output";
  fields: SchemaItem[];
  selectedId: string | null;
  onFieldClick: (field: SchemaItem) => void;
  setRef: (key: string, element: HTMLDivElement | null) => void;
}

export const SchemaFieldList = forwardRef<HTMLDivElement, SchemaFieldListProps>(
  ({ type, fields, selectedId, onFieldClick, setRef }, ref) => {
    if (!fields || fields.length === 0) {
      return <div className="text-sm text-gray-500 p-2">No fields defined</div>;
    }

    return (
      <div ref={ref} className="flex flex-col space-y-1 p-2">
        {fields.map((field) => {
          const isSelected = type === 'input' && selectedId === field.name;
          
          return (
            <div
              key={`${type}-${field.name}`}
              ref={(el) => setRef(field.name, el)}
              data-field-name={field.name}
              data-field-type={type}
              className={`relative flex justify-between items-center p-2 rounded border text-sm cursor-pointer
                group transition-colors duration-150 hover:bg-gray-100
                ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}
              onClick={() => onFieldClick(field)}
            >
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </div>
                {field.description && (
                  <span className="text-xs text-gray-500 mt-1">{field.description}</span>
                )}
              </div>

              <Badge variant="outline" className="text-xs bg-gray-50">
                {field.datatype}
              </Badge>

              {/* Connection point indicator */}
              <div 
                className={`absolute ${type === 'input' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} 
                  top-1/2 -translate-y-1/2 w-2 h-2 rounded-full 
                  ${isSelected ? 'bg-blue-500' : 'bg-gray-300'} 
                  group-hover:bg-blue-400 border border-white`}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

SchemaFieldList.displayName = "SchemaFieldList";

export default SchemaFieldList;