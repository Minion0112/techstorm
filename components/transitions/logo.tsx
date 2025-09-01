import Image from 'next/image'
import logo from '/public/Group.svg'

export function Logo() {
    return (
        <Image src={logo} alt="Logo" width={600} height={0} />
    )
}