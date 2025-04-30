import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const HeroSection = () => {
  return (
    <div className="flex w-full items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src="https://github.com/isntboxs.png" alt="@mrboxs" />
        <AvatarFallback>B</AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">mrboxs</h1>
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          <p>amateur web developer</p>
        </div>
      </div>
    </div>
  );
};
