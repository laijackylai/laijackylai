type Props = {
  text: string
}

const AnimatedText: React.FC<Props> = ({ text }) => {
  return (
    <div className="">
      {text.match(/./gu)!.map((char, index) => (
        <div
          className="animate-text-reveal inline-block [animation-fill-mode:backwards]"
          key={`${char}-${index}`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </div>
      ))}
    </div>
  )
}

export default AnimatedText
