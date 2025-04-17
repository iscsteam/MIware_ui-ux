// src/components/workflow/SchemaFieldList.tsx (or similar path)
"use client"
import React, { forwardRef } from "react";

interface SchemaFieldListProps {
  type: "input" | "output"; // To differentiate element IDs/refs
  schema: Record<string, any> | null | undefined;
  setRef: (key: string, element: HTMLDivElement | null) => void; // Callback to register refs
}

// Using forwardRef to allow parent to potentially get a ref to the list itself if needed
export const SchemaFieldList = forwardRef<HTMLDivElement, SchemaFieldListProps>(
  ({ type, schema, setRef }, ref) => {
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
      return <div className="text-sm text-gray-500 p-2">Invalid or empty schema</div>;
    }

    const fields = Object.keys(schema);

    if (fields.length === 0) {
      return <div className="text-sm text-gray-500 p-2">No fields defined</div>;
    }

    return (
      <div ref={ref} className="flex flex-col space-y-1 p-2">
        {fields.map((fieldName) => (
          <div
            key={`${type}-${fieldName}`}
            // Store the element ref using the callback prop
            ref={(el) => setRef(`${type}-${fieldName}`, el)}
            // Add data attributes for easier identification if needed
            data-field-name={fieldName}
            data-field-type={type}
            className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 text-sm"
          >
            <span className="font-medium text-gray-800">{fieldName}</span>

            {/* Optionally display data type if available and simple */}
            {/* {typeof schema[fieldName] === 'string' && (
               <span className="text-xs text-gray-500 ml-2">({schema[fieldName]})</span>
            )} */}
             {/* Add a small visual cue for connection points */}
             {/* <div className={`
                absolute ${type === 'input' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} top-1/2 -translate-y-1/2
                w-2 h-2 rounded-full bg-gray-400 border border-white group-hover:bg-blue-500
             `}></div> */}
          </div>
        ))}
      </div>
    );
  }
);

SchemaFieldList.displayName = "SchemaFieldList"; // Add display name for DevTools


// Example SchemaFieldList.tsx
