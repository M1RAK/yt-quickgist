export default function Loader() {
	return (
		<div className='w-[420px] h-[480px] bg-white flex items-center justify-center'>
			<div className='flex flex-col items-center gap-4'>
				<div className='relative'>
					<div className='w-12 h-12 rounded-full bg-[#1a73e8] flex items-center justify-center'>
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'>
							<path d='M12 2L2 7L12 12L22 7L12 2Z' fill='white' />
							<path
								d='M2 17L12 22L22 17'
								stroke='white'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
							<path
								d='M2 12L12 17L22 12'
								stroke='white'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</div>
					<div className='absolute inset-0 w-12 h-12 border-[3px] border-[#1a73e8] border-t-transparent rounded-full animate-spin' />
				</div>
				<div className='text-center'>
					<h2 className='text-[22px] font-normal text-[#202124] mb-1'>
						QuickGist
					</h2>
					<p className='text-sm text-[#5f6368]'>Loading...</p>
				</div>
			</div>
		</div>
	)
}
