"use client";
import Image from "next/image";
import type { InfoPanelProps } from "@/types";
import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

export default function InfoPanel({
    title,
    description,
    subDescription,
    buttonText,
    onButtonClick,
    image,
    imageAlt,
    name,
    children,
    topRight,
    buttons,
    className = "",
}: InfoPanelProps) {
    return (
        <section className={`flex flex-col gap-6 ${className}`}>
            <div className="flex justify-between items-start gap-4">
                <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mx-3">{title}</h2>
                {topRight ? (
                    <div className="shrink-0">{topRight}</div>
                ) : null}
            </div>

            <div className="flex items-center justify-center min-h-[calc(100vh-168px)]">
                <div className="text-center mx-auto flex flex-col items-center">
                    <div className="mb-8 flex items-center justify-center">
                        {image ? (
                            <Image
                                src={image}
                                alt={imageAlt ?? (typeof name === "string" ? name : "Empty")}
                                className="w-64 h-48 object-contain rounded-lg"
                                width={256}
                                height={192}
                            />
                        ) : (
                            <div className="h-80 w-80 mx-auto bg-[var(--color-admin-profile-border)]" />
                        )}
                    </div>

                    {name ? (
                        <h3 className="text-lg font-semibold text-[var(--color-neutral-primary)] mb-4">
                            {name}
                        </h3>
                    ) : null}

                    {(description || subDescription) && (
                        <p className="text-[var(--color-neutral-secondary)] text-base mb-8 leading-relaxed whitespace-pre-line">
                            {description}
                            {subDescription ? (
                                <>
                                    <br />
                                    {subDescription}
                                </>
                            ) : null}
                        </p>
                    )}

                    {Array.isArray(buttons) && buttons.length > 0 ? (
                        <div className="flex flex-wrap gap-3 justify-center mb-4">
                            {buttons.map(
                                (
                                    { text, onClick, className: btnClass, variant, appearance, state, icon, iconClassName, size },
                                    index,
                                ) => (
                                    <Button
                                        key={index}
                                        onClick={onClick}
                                        className={btnClass}
                                        size={(size as any) ?? "md"}
                                        variant={(variant as any) ?? "primary"}
                                        appearance={(appearance as any) ?? "outlined"}
                                        state={(state as any)}
                                    >
                                        {icon ? (
                                            <Icon
                                                name={icon}
                                                className={`w-4 h-4 mr-2 inline-flex ${iconClassName ?? ""}`}
                                            />
                                        ) : null}
                                        {text}
                                    </Button>
                                ),
                            )}
                        </div>
                    ) : buttonText ? (
                        <Button
                            variant="primary"
                            appearance="solid"
                            size="md"
                            className="btn-size-md inline-flex items-center space-x-2 bg-[var(--accent-orange)] border border-[var(--primary)] hover:bg-primary-hover text-white rounded-lg font-medium !text-[16px]"
                            onClick={onButtonClick}
                        >
                            <span>{buttonText}</span>
                        </Button>
                    ) : null}

                    {children}
                </div>
            </div>
        </section>
    );
}

