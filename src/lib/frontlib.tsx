
import { useEffect, useState } from 'react';
import { InputProps } from "antd";

interface RightToLeftMaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    maxDigits?: number;
}

export const RightToLeftMaskedInput: React.FC<RightToLeftMaskedInputProps> = ({
    maxDigits = 10,
    onChange,
    ...rest
}) => {
    const [value, setValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value.replace(/\D/g, "");

        if (raw.length > maxDigits) {
            raw = raw.slice(-maxDigits);
        }

        const padded = raw.padStart(maxDigits, " ");
        let formatted = "";

        for (let i = 0; i < padded.length; i++) {
            formatted += padded[i] === " " ? "_" : padded[i];
        }

        setValue(formatted);

        if (onChange) {
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: raw,
                },
            };
            onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
    };

    return (
        <input
            {...rest}
            value={value}
            onChange={handleChange}
            inputMode="numeric"
            pattern="\d*"
            placeholder={"_".repeat(maxDigits)}
            style={{
                fontFamily: "monospace",
                width: `${maxDigits * 12}px`,
                ...(rest.style || {}),
            }}
        />
    );
};

export function validateCPF(cpf: string): boolean {
    // Basic CPF validation logic
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;

    return rev === parseInt(cpf.charAt(10));
}


export function isValidCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    const calc = (length: number) => {
        let sum = 0;
        let pos = length - 7;
        for (let i = 0; i < length - 1; i++) {
            sum += parseInt(cnpj.charAt(i)) * pos--;
            if (pos < 2) pos = 9;
        }
        let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        return result === parseInt(cnpj.charAt(length - 1));
    };

    return calc(13) && calc(14);
}

