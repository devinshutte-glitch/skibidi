import SurferGirl from './avatars/SurferGirl'
import SurferBoy from './avatars/SurferBoy'
import DadIcon from './avatars/DadIcon'

interface Props {
  avatar: string
  size?: number
  className?: string
}

export default function AvatarComponent({ avatar, size = 120, className = '' }: Props) {
  switch (avatar) {
    case 'surfer_girl':
      return <SurferGirl size={size} className={className} />
    case 'surfer_boy':
      return <SurferBoy size={size} className={className} />
    case 'dad_icon':
      return <DadIcon size={size} className={className} />
    default:
      return <SurferBoy size={size} className={className} />
  }
}
