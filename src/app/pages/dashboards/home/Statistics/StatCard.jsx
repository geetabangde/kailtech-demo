import { Avatar, Card } from "components/ui";
import { Link } from "react-router-dom";

export function StatCard({ title, mainCount, icon: Icon, color = "info", items = [] }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-semibold text-gray-800 dark:text-dark-50">{title}</p>
          {mainCount !== undefined && (
            <p className={`this:${color} mt-1 text-2xl font-bold text-this dark:text-this-lighter`}>
              {mainCount}
            </p>
          )}
        </div>
        {Icon && (
          <Avatar
            size={12}
            classNames={{
              display: "mask is-squircle rounded-none",
            }}
            initialVariant="soft"
            initialColor={color}
          >
            <Icon className="size-6" />
          </Avatar>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-dark-500">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className={`text-gray-600 dark:text-dark-200 ${item.bold ? 'font-semibold text-gray-900 dark:text-dark-50' : ''}`}>
                {item.href && item.href !== "#" ? (
                  <Link to={item.href} className="hover:text-blue-600 hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </span>
              <span className="font-medium text-gray-800 dark:text-dark-100">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
