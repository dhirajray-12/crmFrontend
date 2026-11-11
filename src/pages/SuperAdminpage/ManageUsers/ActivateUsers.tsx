function ActivateUsers() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold">Activate Users</h1>
          <p className="mt-2">Manage user activation and permissions.</p>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold">User List</h2>
          <ul className="list-disc list-inside">
            <li>User 1</li>
            <li>User 2</li>
            <li>User 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ActivateUsers;
