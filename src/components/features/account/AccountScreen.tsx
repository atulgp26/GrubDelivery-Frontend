import type React from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/components/features/account/hooks/useAccount";
import LoadingDetails from "@/components/ui/LoadingDetails";
import { Button } from "@/components/ui/Button";
import ProfileSection from "@/components/features/account/components/ProfileSection";
import DetailsSection from "@/components/features/account/components/DetailsSection";
import AccountFooter from "@/components/features/account/components/AccountFooter";
import EditProfileModal from "@/components/features/account/modals/EditProfileModal";
import DeleteAccountModal from "@/components/features/account/modals/DeleteAccountModal";
import FigIcon from "@/components/ui/FigIcon";
import { showError } from "@/components/ui/toast";
import OtpVerifyModal from "@/components/features/auth/modals/OtpVerifyModal";

function AccountScreenContent(): React.ReactElement {
	const router = useRouter();
	const {
		state,
		updateState,
		fields,
		roleKey,
		userData,
		isLoading,
		otp,
		otpRefs,
		setOtp,
		handleEditSave,
		handlePasswordChange,
		handleSendOtp,
		handleConfirmOtp,
		handleResendOtp,
		handleDelete,
		handleDeleteAccount,
		handleOtpVerify,
	} = useAccount();

	if (isLoading) {
		return <LoadingDetails entity="profile" />;
	}

	if (!userData) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="text-lg text-red-500">
					Failed to load profile data
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] !ml-[16px]">
					Your account
				</h1>
				<Button
					variant="primary"
					appearance="outlined"
					state="press"
					onClick={() => updateState({ editOpen: true })}
					className="flex items-center gap-2 h-[40px]"
				>
					<FigIcon
						name="Settings/pen-line"
						size={16}
						className="w-4 h-4"
					/>
					<span>EDIT</span>
				</Button>
			</div>
			<div className="flex justify-center items-center w-full min-h-[40vh]">
				<div className="grid grid-cols-16 gap-6 w-full">
					<div className="col-span-4">
						<ProfileSection
							name={userData.name}
							id={userData.id}
							employeeDisplayId={userData.employeeDisplayId}
						/>
					</div>

					<div className="col-span-10 col-start-5">
						<DetailsSection
							basicDetails={userData.basicDetails}
							professionalDetails={userData.professionalDetails}
						/>
					</div>
				</div>
			</div>
			<AccountFooter
				createdAt={userData.createdAt}
				onDelete={handleDelete}
				allowDelete={true}
			/>

			<EditProfileModal
				open={state.editOpen}
				onClose={() => updateState({ editOpen: false })}
				onSave={handleEditSave}
				onPasswordChange={handlePasswordChange}
				onSendOtp={handleSendOtp}
				onConfirmOtp={handleConfirmOtp}
				onResendOtp={handleResendOtp}
				fields={fields}
				roleKey={roleKey}
			/>
			<DeleteAccountModal
				open={state.deleteOpen}
				onClose={() => updateState({ deleteOpen: false })}
				onDelete={handleDeleteAccount}
				onSupport={() => {
					updateState({ deleteOpen: false });
					router.push("/transfer-ownership");
				}}
			/>
			<OtpVerifyModal
				open={state.otpModalOpen}
				onClose={() => updateState({ otpModalOpen: false })}
				email={userData?.basicDetails?.email || ""}
				otp={otp}
				setOtp={setOtp}
				timer={0}
				onBack={() => {
					updateState({
						otpModalOpen: false,
						deleteOpen: true,
						otpError: false,
					});
				}}
				onVerify={handleOtpVerify}
				otpRefs={otpRefs}
				otpError={state.otpError}
				onResend={() => {
					showError(
						"Please contact support to resend OTP for account deletion",
					);
				}}
				title="Verify Account Deletion"
				message="Enter the OTP sent to your email to confirm account deletion"
				showBackButton={true}
				buttonText="DELETE ACCOUNT"
			/>
		</div>
	);
}

export default function AccountScreen(): React.ReactElement {
	return <AccountScreenContent />;
}
