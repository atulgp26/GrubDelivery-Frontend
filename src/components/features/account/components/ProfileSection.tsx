export default function ProfileSection({
	name,
	id,
	employeeDisplayId,
}: {
	name?: string;
	id?: string;
	employeeDisplayId?: string;
}) {
	return (
		<div className="flex flex-col py-8 px-8">
			<div className="w-32 h-32 bg-[var(--color-brand-primary-btn)] rounded-full flex items-center justify-center mb-6">
				<span className="text-white text-4xl font-bold">
					{name
						?.split(" ")
						.map((n) => n[0])
						.join("") || ""}
				</span>
			</div>
			<div className="">
				<h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
					{name && name.length > 25
						? `${name.substring(0, 25)}...`
						: name}
				</h2>
				{employeeDisplayId && (
					<p className="text-[var(--color-neutral-secondary)] text-base mt-1">
						#{employeeDisplayId}
					</p>
				)}
				{/* <p className="text-[var(--color-neutral-secondary)] text-base mt-1">{id}</p> */}
			</div>
		</div>
	);
}
