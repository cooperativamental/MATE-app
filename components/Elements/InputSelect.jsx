const InputSelect = (props) => {
     const {
          inputStyle,
          id,
          value,
          type,
          name,
          placeholder,
          onChange,
          optionDisabled,
          select,
          conditionError,
          children,
          title,
          subtitle,
          styleTitle,
          styleSubtitle,
          forwardedRef,
          defaultValue,
          ...restAttr
     } = props || {}

     if (select) {
          return (
               <div className="flex flex-col gap-2 w-full">
                    {
                         title &&
                         <p className={`${styleTitle} font-normal text-xl`}>{title}</p>
                    }
                    <select
                         className={`${inputStyle} flex bg-slate-800 appearance-none rounded-xl w-full h-20 text-xl pl-4 ${conditionError ? " shadow-red-600" : "shadow-green-light"}`}
                         name={name}
                         onChange={onChange}
                         defaultValue={ defaultValue || optionDisabled}
                         id={id}
                         value={value}
                         type={type}
                         placeholder={placeholder}
                         ref={forwardedRef}
                         {...restAttr}
                    >
                         {
                              optionDisabled &&
                              <option disabled>{optionDisabled} </option>
                         }
                         {children}
                    </select>
                    {
                         subtitle &&
                         <p className={`${styleSubtitle} font-light text-sm`}>{subtitle}</p>
                    }
               </div>
          )
     }
     else {
          return (
               <div className="flex flex-col gap-2 w-full">
                    {
                         title &&
                         <p className={`${styleTitle} text-center`}>{title}</p>
                    }
                    <input
                         className={`${inputStyle} flex bg-slate-900 appearance-none rounded-full w-full h-20 text-xl px-4 
                         ring-1 caret-slate-100
                         ${conditionError ? " shadow-red-600" : "shadow-green-light"} ${type === "date" && "date"}`}
                         name={name}
                         onChange={onChange}
                         id={id}
                         value={value}
                         type={type}
                         ref={forwardedRef}
                         placeholder={placeholder}
                         {...restAttr}
                    />
                    {
                         subtitle &&
                         <p className={styleSubtitle}>{subtitle}</p>
                    }
               </div>
          )
     }
};


export default InputSelect;